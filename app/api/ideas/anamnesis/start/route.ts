import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
	InsufficientFundsError,
	startAnamnesisSession,
} from "@/lib/wallet/service";

/**
 * Старт опроса «по анамнезу»: предоплата до первого обращения к нейросети.
 * Списывает стоимость и открывает сессию (или переиспользует уже оплаченную).
 * Дальнейшие вопросы и финальный подбор идеи привязаны к этой сессии.
 */
export async function POST(request: NextRequest) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) {
		return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
	}

	try {
		const result = await startAnamnesisSession({ userId: session.user.id });
		return NextResponse.json(result, { status: 201 });
	} catch (error) {
		if (error instanceof InsufficientFundsError) {
			return NextResponse.json(
				{ error: "Недостаточно средств — пополните баланс", code: "insufficient" },
				{ status: 402 },
			);
		}
		console.error("[ideas] ошибка старта опроса по анамнезу:", error);
		return NextResponse.json(
			{ error: "Не удалось начать подбор. Попробуйте позже." },
			{ status: 500 },
		);
	}
}
