import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
	AnalysisAlreadyChargedError,
	chargeForAnalysis,
	InsufficientFundsError,
} from "@/lib/wallet/service";

/**
 * Запуск AI-анализа идеи: списывает стоимость анализа с баланса и фиксирует
 * операцию. `mode: "update"` — повторный анализ (списывает каждый раз),
 * по умолчанию — первый запуск (идемпотентен).
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) {
		return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
	}

	const { id } = await params;

	let body: { mode?: unknown } = {};
	try {
		body = await request.json();
	} catch {
		// Тело необязательно — режим по умолчанию «initial».
	}
	const mode = body.mode === "update" ? "update" : "initial";

	try {
		const result = await chargeForAnalysis({
			userId: session.user.id,
			ideaId: id,
			mode,
		});
		if (!result) {
			return NextResponse.json({ error: "Идея не найдена" }, { status: 404 });
		}
		return NextResponse.json(result);
	} catch (error) {
		if (error instanceof InsufficientFundsError) {
			return NextResponse.json(
				{ error: "Недостаточно средств — пополните баланс", code: "insufficient" },
				{ status: 402 },
			);
		}
		if (error instanceof AnalysisAlreadyChargedError) {
			return NextResponse.json(
				{ error: "Анализ для этой идеи уже запускался", code: "already" },
				{ status: 409 },
			);
		}
		console.error("[ideas] ошибка запуска анализа:", error);
		return NextResponse.json(
			{ error: "Не удалось запустить анализ. Попробуйте позже." },
			{ status: 500 },
		);
	}
}
