import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { generateAnalysis } from "@/lib/llm/analysis";
import { markAnalysisFailed, saveAnalysisResult } from "@/lib/ideas/service";
import {
	AnalysisAlreadyChargedError,
	chargeForAnalysis,
	InsufficientFundsError,
} from "@/lib/wallet/service";

/**
 * Запуск AI-анализа идеи: списывает стоимость, генерирует отчёт нейросетью и
 * сохраняет его. `mode: "update"` — повторный анализ (списывает каждый раз),
 * по умолчанию — первый запуск (идемпотентен). Деньги списываются до генерации;
 * при сбое генерации возврат выполняется вручную из админки.
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

	let charge;
	try {
		charge = await chargeForAnalysis({
			userId: session.user.id,
			ideaId: id,
			mode,
		});
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
		console.error("[ideas] ошибка списания за анализ:", error);
		return NextResponse.json(
			{ error: "Не удалось запустить анализ. Попробуйте позже." },
			{ status: 500 },
		);
	}

	if (!charge) {
		return NextResponse.json({ error: "Идея не найдена" }, { status: 404 });
	}

	try {
		const report = await generateAnalysis({
			idea: charge.idea,
			version: charge.version,
		});
		await saveAnalysisResult({
			userId: session.user.id,
			ideaId: id,
			report,
		});
		return NextResponse.json({
			balance: charge.balance,
			transaction: charge.transaction,
			report,
		});
	} catch (error) {
		// Списание уже произошло (charge-first) — фиксируем провал, возврат вручную.
		await markAnalysisFailed({ userId: session.user.id, ideaId: id });
		console.error("[ideas] ошибка генерации анализа:", error);
		return NextResponse.json(
			{
				error:
					"Анализ не удался при обращении к нейросети. Средства будут возвращены — напишите в поддержку.",
				code: "generation",
				balance: charge.balance,
				transaction: charge.transaction,
			},
			{ status: 502 },
		);
	}
}
