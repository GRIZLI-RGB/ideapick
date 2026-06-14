import { NextResponse, after, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { rateLimitGuard } from "@/lib/rate-limit";
import {
	runAnalysisJob,
	sweepStaleAnalysis,
} from "@/lib/ideas/analysis-pipeline";
import { getAnalysisRow } from "@/lib/ideas/service";
import {
	AnalysisAlreadyChargedError,
	chargeForAnalysis,
	InsufficientFundsError,
} from "@/lib/wallet/service";

/**
 * Запуск AI-анализа идеи. Списывает стоимость и запускает генерацию в фоне
 * (`after()`), сразу отвечая `status: "pending"` — клиент далее опрашивает статус
 * (GET ниже). `mode: "update"` — повторный анализ (списывает каждый раз), по
 * умолчанию — первый запуск (идемпотентен).
 *
 * Возврат при сбое генерации выполняется автоматически внутри фоновой задачи
 * (см. `runAnalysisJob`), поэтому переживает закрытие вкладки.
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) {
		return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
	}
	const userId = session.user.id;

	// Защита от частых запусков анализа (даблклик/спам дорогой AI-операции).
	const limited = rateLimitGuard({
		key: `analyze:${userId}`,
		limit: 10,
		windowMs: 60_000,
	});
	if (limited) return limited;

	const { id } = await params;

	let body: { mode?: unknown } = {};
	try {
		body = await request.json();
	} catch {
		// Тело необязательно — режим по умолчанию «initial».
	}
	const mode = body.mode === "update" ? "update" : "initial";

	// Если предыдущий запуск «завис» в pending (рестарт во время генерации) —
	// разруливаем его до списания, иначе charge упрётся в защиту от повтора.
	await sweepStaleAnalysis({ userId, ideaId: id }).catch(() => {});

	let charge;
	try {
		charge = await chargeForAnalysis({ userId, ideaId: id, mode });
	} catch (error) {
		if (error instanceof InsufficientFundsError) {
			return NextResponse.json(
				{ error: "Недостаточно средств — пополните баланс", code: "insufficient" },
				{ status: 402 },
			);
		}
		if (error instanceof AnalysisAlreadyChargedError) {
			// Анализ уже в полёте — клиент просто продолжит опрашивать статус.
			return NextResponse.json(
				{ error: "Анализ для этой идеи уже выполняется", code: "already" },
				{ status: 409 },
			);
		}
		console.error("[ideas] ошибка списания за анализ:", error);
		return NextResponse.json(
			{ error: "Не удалось запустить анализ. Попробуйте позже." },
			{ status: 500 },
		);
	}

	if (!charge) {
		return NextResponse.json({ error: "Идея не найдена" }, { status: 404 });
	}

	// Генерация — в фоне, после ответа. Возврат при сбое внутри задачи.
	after(() =>
		runAnalysisJob({
			userId,
			ideaId: id,
			idea: charge.idea,
			version: charge.version,
			chargeTransactionId: charge.transaction.id,
		}),
	);

	return NextResponse.json(
		{
			status: "pending",
			balance: charge.balance,
			transaction: charge.transaction,
		},
		{ status: 202 },
	);
}

/**
 * Статус анализа для поллинга клиентом: `pending` | `ok` | `failed`. Перед
 * ответом лениво «подметает» зависшие запуски (возврат денег при необходимости).
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) {
		return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
	}
	const userId = session.user.id;
	const { id } = await params;

	await sweepStaleAnalysis({ userId, ideaId: id }).catch(() => {});

	const row = await getAnalysisRow({ userId, ideaId: id });
	if (!row) {
		return NextResponse.json({ error: "Идея не найдена" }, { status: 404 });
	}

	return NextResponse.json({
		status: row.status,
		score: row.score,
		report: row.status === "ok" ? row.report : null,
	});
}
