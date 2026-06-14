import "server-only";

import { randomUUID } from "node:crypto";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/drizzle";
import { idea, payment, user, walletTransaction } from "@/drizzle/schema";
import { PRICES } from "@/lib/ideas/constants";
import { calcTopUpBonus, TOP_UP_MAX, TOP_UP_MIN } from "@/lib/wallet/bonus";
import type { Transaction, TransactionKind } from "@/lib/wallet/types";
import {
	createYookassaPayment,
	getYookassaPayment,
	isYookassaConfigured,
} from "@/lib/wallet/yookassa";

const WELCOME_BONUS = PRICES.welcomeBonus;

function appUrl(): string {
	return (
		process.env.NEXT_PUBLIC_APP_URL ??
		process.env.BETTER_AUTH_URL ??
		"http://localhost:3000"
	).replace(/\/$/, "");
}

function toClientTransaction(row: typeof walletTransaction.$inferSelect): Transaction {
	return {
		id: row.id,
		kind: row.kind as TransactionKind,
		amount: row.amount,
		label: row.label,
		createdAt: row.createdAt.toISOString(),
	};
}

/**
 * Приветственный бонус +100 ₽ при первой регистрации. Идемпотентно: если бонус
 * уже начислялся (есть транзакция kind='welcome'), повторно не начисляет.
 */
export async function grantWelcomeBonus(userId: string): Promise<void> {
	await db.transaction(async (tx) => {
		const existing = await tx
			.select({ id: walletTransaction.id })
			.from(walletTransaction)
			.where(
				and(
					eq(walletTransaction.userId, userId),
					eq(walletTransaction.kind, "welcome"),
				),
			)
			.limit(1);

		if (existing.length > 0) return;

		await tx
			.update(user)
			.set({ balance: sql`${user.balance} + ${WELCOME_BONUS}` })
			.where(eq(user.id, userId));

		await tx.insert(walletTransaction).values({
			id: randomUUID(),
			userId,
			kind: "welcome",
			amount: WELCOME_BONUS,
			label: "Приветственный бонус",
		});
	});
}

export type WalletState = {
	balance: number;
	transactions: Transaction[];
};

export async function getWalletState(userId: string): Promise<WalletState> {
	const [u] = await db
		.select({ balance: user.balance })
		.from(user)
		.where(eq(user.id, userId))
		.limit(1);

	const rows = await db
		.select()
		.from(walletTransaction)
		.where(eq(walletTransaction.userId, userId))
		.orderBy(desc(walletTransaction.createdAt));

	return {
		balance: u?.balance ?? 0,
		transactions: rows.map(toClientTransaction),
	};
}

export class TopUpValidationError extends Error {}

export type CreateTopUpResult = {
	paymentId: string;
	confirmationUrl: string;
};

/**
 * Создаёт платёж пополнения и возвращает URL подтверждения (ЮKassa redirect).
 * В test-режиме (ключи ЮKassa не заданы) возвращает внутренний URL, который
 * имитирует успешную оплату.
 */
export async function createTopUpPayment({
	userId,
	amount,
	returnPath,
}: {
	userId: string;
	amount: number;
	returnPath: string;
}): Promise<CreateTopUpResult> {
	if (!Number.isInteger(amount) || amount < TOP_UP_MIN || amount > TOP_UP_MAX) {
		throw new TopUpValidationError(
			`Сумма должна быть целым числом от ${TOP_UP_MIN} до ${TOP_UP_MAX} ₽`,
		);
	}

	const safeReturnPath =
		returnPath.startsWith("/") && !returnPath.startsWith("//")
			? returnPath
			: "/app/ideas";

	const bonus = calcTopUpBonus(amount);
	const credited = amount + bonus;
	const id = randomUUID();
	const idempotenceKey = randomUUID();
	const description = `Пополнение баланса Ideapick на ${amount} ₽`;
	const returnUrl = `${appUrl()}/api/wallet/return?paymentId=${id}`;

	if (!isYookassaConfigured()) {
		// Test-режим: платёж сразу готов к "оплате" через внутренний return-роут.
		await db.insert(payment).values({
			id,
			userId,
			amount,
			bonus,
			credited,
			status: "pending",
			provider: "test",
			idempotenceKey,
			description,
			returnPath: safeReturnPath,
		});
		return { paymentId: id, confirmationUrl: returnUrl };
	}

	await db.insert(payment).values({
		id,
		userId,
		amount,
		bonus,
		credited,
		status: "pending",
		provider: "yookassa",
		idempotenceKey,
		description,
		returnPath: safeReturnPath,
	});

	const yk = await createYookassaPayment({
		amountRubles: amount,
		description,
		idempotenceKey,
		returnUrl,
		metadata: { paymentId: id, userId },
	});

	const confirmationUrl = yk.confirmation?.confirmation_url;
	if (!confirmationUrl) {
		await db
			.update(payment)
			.set({ status: "canceled", updatedAt: new Date() })
			.where(eq(payment.id, id));
		throw new Error("ЮKassa не вернула confirmation_url");
	}

	await db
		.update(payment)
		.set({ providerPaymentId: yk.id, updatedAt: new Date() })
		.where(eq(payment.id, id));

	return { paymentId: id, confirmationUrl };
}

export type CaptureResult = {
	status: "succeeded" | "pending" | "canceled" | "not_found";
	returnPath: string;
};

/**
 * Фиксирует платёж: зачисляет средства на баланс и пишет транзакцию.
 * Идемпотентно — повторный вызов для уже зафиксированного платежа безопасен.
 * Вызывается из return-роута и из вебхука ЮKassa.
 */
export async function capturePayment(paymentId: string): Promise<CaptureResult> {
	// Для ЮKassa сверяем реальный статус во внешнем API до изменения баланса.
	const [head] = await db
		.select()
		.from(payment)
		.where(eq(payment.id, paymentId))
		.limit(1);

	if (!head) return { status: "not_found", returnPath: "/app/ideas" };
	if (head.status === "succeeded")
		return { status: "succeeded", returnPath: head.returnPath };
	if (head.status === "canceled")
		return { status: "canceled", returnPath: head.returnPath };

	let externalSucceeded = head.provider === "test";
	let externalCanceled = false;

	if (head.provider === "yookassa" && head.providerPaymentId) {
		const yk = await getYookassaPayment(head.providerPaymentId);
		externalSucceeded = yk.status === "succeeded";
		externalCanceled = yk.status === "canceled";
	}

	if (externalCanceled) {
		await db
			.update(payment)
			.set({ status: "canceled", updatedAt: new Date() })
			.where(eq(payment.id, paymentId));
		return { status: "canceled", returnPath: head.returnPath };
	}

	if (!externalSucceeded) {
		return { status: "pending", returnPath: head.returnPath };
	}

	// Атомарная фиксация под блокировкой строки платежа.
	const result = await db.transaction(async (tx) => {
		const [locked] = await tx
			.select()
			.from(payment)
			.where(eq(payment.id, paymentId))
			.for("update");

		if (!locked || locked.status !== "pending") {
			return locked?.status === "succeeded" ? "succeeded" : "pending";
		}

		await tx
			.update(payment)
			.set({ status: "succeeded", capturedAt: new Date(), updatedAt: new Date() })
			.where(eq(payment.id, paymentId));

		await tx
			.update(user)
			.set({ balance: sql`${user.balance} + ${locked.credited}` })
			.where(eq(user.id, locked.userId));

		const label =
			locked.bonus > 0
				? `Пополнение · +${locked.bonus} ₽ бонус`
				: "Пополнение";

		await tx.insert(walletTransaction).values({
			id: randomUUID(),
			userId: locked.userId,
			kind: "topup",
			amount: locked.credited,
			label,
			paymentId: locked.id,
		});

		return "succeeded" as const;
	});

	return {
		status: result === "succeeded" ? "succeeded" : "pending",
		returnPath: head.returnPath,
	};
}

/** Недостаточно средств на балансе для списания за анализ. */
export class InsufficientFundsError extends Error {}

/** Анализ уже запускался для этой идеи (защита от повторного списания). */
export class AnalysisAlreadyChargedError extends Error {}

export type AnalysisChargeMode = "initial" | "update";

export type AnalysisChargeResult = {
	ideaId: string;
	balance: number;
	transaction: Transaction;
	/** Данные идеи для генерации отчёта нейросетью. */
	idea: { id: string; userId: string; title: string; description: string };
	/** Номер запуска: 1 — первый, +1 на каждое обновление. */
	version: number;
};

/**
 * Списывает {@link PRICES.analysis} ₽ за запуск AI-анализа идеи и атомарно
 * фиксирует операцию в леджере. Балл считается детерминированно из текущего
 * демо-генератора, чтобы баланс, идея и отчёт оставались согласованными.
 *
 * Режимы:
 *  - `initial` — первый запуск. Идемпотентен: если идея уже проанализирована,
 *    бросает {@link AnalysisAlreadyChargedError} вместо повторного списания.
 *  - `update` — повторный анализ по явному действию пользователя; списывает
 *    каждый раз.
 *
 * Бросает {@link InsufficientFundsError} при нехватке средств. Возвращает
 * `null`, если идея не найдена у пользователя.
 */
export async function chargeForAnalysis({
	userId,
	ideaId,
	mode = "initial",
}: {
	userId: string;
	ideaId: string;
	mode?: AnalysisChargeMode;
}): Promise<AnalysisChargeResult | null> {
	const price = PRICES.analysis;

	return await db.transaction(async (tx) => {
		// Блокируем строку идеи: проверка владельца + защита от гонок двойного
		// клика/повторного запроса.
		const [ideaRow] = await tx
			.select()
			.from(idea)
			.where(and(eq(idea.id, ideaId), eq(idea.userId, userId)))
			.for("update");

		if (!ideaRow) return null;
		if (mode === "initial" && ideaRow.hasAnalysis) {
			throw new AnalysisAlreadyChargedError();
		}
		// Анализ уже выполняется (другой запрос в полёте) — не списываем повторно.
		if (ideaRow.analysisStatus === "pending") {
			throw new AnalysisAlreadyChargedError();
		}

		const [u] = await tx
			.select({ balance: user.balance })
			.from(user)
			.where(eq(user.id, userId))
			.for("update");

		if (!u || u.balance < price) throw new InsufficientFundsError();

		const newBalance = u.balance - price;
		const version =
			mode === "update" ? (ideaRow.analysisReport?.version ?? 1) + 1 : 1;

		await tx
			.update(user)
			.set({ balance: sql`${user.balance} - ${price}` })
			.where(eq(user.id, userId));

		// Помечаем запуск анализа; отчёт и score проставит роут после генерации.
		await tx
			.update(idea)
			.set({ analysisStatus: "pending", updatedAt: new Date() })
			.where(eq(idea.id, ideaId));

		const txId = randomUUID();
		const label =
			mode === "update"
				? `Обновление анализа · ${ideaRow.title}`
				: `Анализ · ${ideaRow.title}`;

		await tx.insert(walletTransaction).values({
			id: txId,
			userId,
			kind: "analysis",
			amount: -price,
			label,
		});

		return {
			ideaId,
			balance: newBalance,
			version,
			idea: {
				id: ideaRow.id,
				userId: ideaRow.userId,
				title: ideaRow.title,
				description: ideaRow.description,
			},
			transaction: {
				id: txId,
				kind: "analysis",
				amount: -price,
				label,
				createdAt: new Date().toISOString(),
			},
		};
	});
}
