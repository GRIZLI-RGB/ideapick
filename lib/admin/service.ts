import "server-only";

import { randomUUID } from "node:crypto";
import { and, count, desc, eq, gte, ilike, or, sum } from "drizzle-orm";
import { db } from "@/drizzle";
import {
	idea,
	payment,
	supportTicket,
	user,
	walletTransaction,
} from "@/drizzle/schema";

export const ADMIN_PAGE_SIZE = 25;

export class AdminValidationError extends Error {}

function daysAgo(days: number): Date {
	return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

// ---------------------------------------------------------------------------
// Дашборд
// ---------------------------------------------------------------------------

export type DashboardStats = {
	usersTotal: number;
	usersNew7d: number;
	ideasTotal: number;
	revenueTotal: number;
	revenue30d: number;
	openTickets: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
	const [
		[usersTotal],
		[usersNew7d],
		[ideasTotal],
		[revenueTotal],
		[revenue30d],
		[openTickets],
	] = await Promise.all([
		db.select({ value: count() }).from(user),
		db
			.select({ value: count() })
			.from(user)
			.where(gte(user.createdAt, daysAgo(7))),
		db.select({ value: count() }).from(idea),
		db
			.select({ value: sum(payment.amount) })
			.from(payment)
			.where(eq(payment.status, "succeeded")),
		db
			.select({ value: sum(payment.amount) })
			.from(payment)
			.where(
				and(
					eq(payment.status, "succeeded"),
					gte(payment.createdAt, daysAgo(30)),
				),
			),
		db
			.select({ value: count() })
			.from(supportTicket)
			.where(
				or(
					eq(supportTicket.status, "open"),
					eq(supportTicket.status, "in_progress"),
				),
			),
	]);

	return {
		usersTotal: usersTotal.value,
		usersNew7d: usersNew7d.value,
		ideasTotal: ideasTotal.value,
		revenueTotal: Number(revenueTotal.value ?? 0),
		revenue30d: Number(revenue30d.value ?? 0),
		openTickets: openTickets.value,
	};
}

// ---------------------------------------------------------------------------
// Пользователи
// ---------------------------------------------------------------------------

export type AdminUserRow = {
	id: string;
	name: string;
	email: string;
	balance: number;
	role: string;
	banned: boolean;
	ideasCount: number;
	createdAt: string;
};

export async function listUsers({
	query,
	page,
}: {
	query?: string;
	page: number;
}): Promise<{ users: AdminUserRow[]; total: number }> {
	const where = query
		? or(ilike(user.email, `%${query}%`), ilike(user.name, `%${query}%`))
		: undefined;

	const ideasCount = db.$count(idea, eq(idea.userId, user.id));

	const [rows, [totalRow]] = await Promise.all([
		db
			.select({
				id: user.id,
				name: user.name,
				email: user.email,
				balance: user.balance,
				role: user.role,
				banned: user.banned,
				createdAt: user.createdAt,
				ideasCount,
			})
			.from(user)
			.where(where)
			.orderBy(desc(user.createdAt))
			.limit(ADMIN_PAGE_SIZE)
			.offset((page - 1) * ADMIN_PAGE_SIZE),
		db.select({ value: count() }).from(user).where(where),
	]);

	return {
		users: rows.map((row) => ({
			...row,
			ideasCount: Number(row.ideasCount),
			createdAt: row.createdAt.toISOString(),
		})),
		total: totalRow.value,
	};
}

export type AdminUserDetail = {
	id: string;
	name: string;
	email: string;
	image: string | null;
	balance: number;
	role: string;
	banned: boolean;
	banReason: string | null;
	createdAt: string;
	ideas: { id: string; title: string; source: string; createdAt: string }[];
	payments: {
		id: string;
		amount: number;
		credited: number;
		status: string;
		provider: string;
		createdAt: string;
	}[];
	transactions: {
		id: string;
		kind: string;
		amount: number;
		label: string;
		createdAt: string;
	}[];
};

export async function getUserDetail(
	userId: string,
): Promise<AdminUserDetail | null> {
	const [u] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
	if (!u) return null;

	const [ideas, payments, transactions] = await Promise.all([
		db
			.select()
			.from(idea)
			.where(eq(idea.userId, userId))
			.orderBy(desc(idea.createdAt))
			.limit(50),
		db
			.select()
			.from(payment)
			.where(eq(payment.userId, userId))
			.orderBy(desc(payment.createdAt))
			.limit(50),
		db
			.select()
			.from(walletTransaction)
			.where(eq(walletTransaction.userId, userId))
			.orderBy(desc(walletTransaction.createdAt))
			.limit(50),
	]);

	return {
		id: u.id,
		name: u.name,
		email: u.email,
		image: u.image,
		balance: u.balance,
		role: u.role,
		banned: u.banned,
		banReason: u.banReason,
		createdAt: u.createdAt.toISOString(),
		ideas: ideas.map((i) => ({
			id: i.id,
			title: i.title,
			source: i.source,
			createdAt: i.createdAt.toISOString(),
		})),
		payments: payments.map((p) => ({
			id: p.id,
			amount: p.amount,
			credited: p.credited,
			status: p.status,
			provider: p.provider,
			createdAt: p.createdAt.toISOString(),
		})),
		transactions: transactions.map((t) => ({
			id: t.id,
			kind: t.kind,
			amount: t.amount,
			label: t.label,
			createdAt: t.createdAt.toISOString(),
		})),
	};
}

/**
 * Ручная корректировка баланса (+/−). Атомарно: баланс + запись в леджер.
 * Не позволяет увести баланс в минус.
 */
export async function adjustUserBalance({
	userId,
	amount,
	comment,
}: {
	userId: string;
	amount: number;
	comment?: string;
}): Promise<{ balance: number }> {
	if (!Number.isInteger(amount) || amount === 0 || Math.abs(amount) > 100_000) {
		throw new AdminValidationError(
			"Сумма — целое число от −100 000 до 100 000, не ноль",
		);
	}

	return db.transaction(async (tx) => {
		const [locked] = await tx
			.select({ balance: user.balance })
			.from(user)
			.where(eq(user.id, userId))
			.for("update");

		if (!locked) {
			throw new AdminValidationError("Пользователь не найден");
		}

		const nextBalance = locked.balance + amount;
		if (nextBalance < 0) {
			throw new AdminValidationError(
				`Баланс не может стать отрицательным (сейчас ${locked.balance} ₽)`,
			);
		}

		await tx
			.update(user)
			.set({ balance: nextBalance, updatedAt: new Date() })
			.where(eq(user.id, userId));

		await tx.insert(walletTransaction).values({
			id: randomUUID(),
			userId,
			kind: "adjustment",
			amount,
			label: comment?.trim()
				? `Корректировка: ${comment.trim()}`
				: "Корректировка баланса",
		});

		return { balance: nextBalance };
	});
}

// ---------------------------------------------------------------------------
// Платежи
// ---------------------------------------------------------------------------

export type AdminPaymentRow = {
	id: string;
	userId: string;
	userEmail: string;
	amount: number;
	bonus: number;
	credited: number;
	status: string;
	provider: string;
	providerPaymentId: string | null;
	createdAt: string;
};

export async function listPayments({
	status,
	page,
}: {
	status?: string;
	page: number;
}): Promise<{ payments: AdminPaymentRow[]; total: number }> {
	const where = status ? eq(payment.status, status) : undefined;

	const [rows, [totalRow]] = await Promise.all([
		db
			.select({ payment: payment, userEmail: user.email })
			.from(payment)
			.innerJoin(user, eq(payment.userId, user.id))
			.where(where)
			.orderBy(desc(payment.createdAt))
			.limit(ADMIN_PAGE_SIZE)
			.offset((page - 1) * ADMIN_PAGE_SIZE),
		db.select({ value: count() }).from(payment).where(where),
	]);

	return {
		payments: rows.map(({ payment: p, userEmail }) => ({
			id: p.id,
			userId: p.userId,
			userEmail,
			amount: p.amount,
			bonus: p.bonus,
			credited: p.credited,
			status: p.status,
			provider: p.provider,
			providerPaymentId: p.providerPaymentId,
			createdAt: p.createdAt.toISOString(),
		})),
		total: totalRow.value,
	};
}

// ---------------------------------------------------------------------------
// Идеи
// ---------------------------------------------------------------------------

export type AdminIdeaRow = {
	id: string;
	title: string;
	source: string;
	score: number | null;
	userId: string;
	userEmail: string;
	createdAt: string;
};

export async function listAllIdeas({
	query,
	page,
}: {
	query?: string;
	page: number;
}): Promise<{ ideas: AdminIdeaRow[]; total: number }> {
	const where = query
		? or(ilike(idea.title, `%${query}%`), ilike(user.email, `%${query}%`))
		: undefined;

	const [rows, [totalRow]] = await Promise.all([
		db
			.select({ idea: idea, userEmail: user.email })
			.from(idea)
			.innerJoin(user, eq(idea.userId, user.id))
			.where(where)
			.orderBy(desc(idea.createdAt))
			.limit(ADMIN_PAGE_SIZE)
			.offset((page - 1) * ADMIN_PAGE_SIZE),
		db
			.select({ value: count() })
			.from(idea)
			.innerJoin(user, eq(idea.userId, user.id))
			.where(where),
	]);

	return {
		ideas: rows.map(({ idea: i, userEmail }) => ({
			id: i.id,
			title: i.title,
			source: i.source,
			score: i.score,
			userId: i.userId,
			userEmail,
			createdAt: i.createdAt.toISOString(),
		})),
		total: totalRow.value,
	};
}
