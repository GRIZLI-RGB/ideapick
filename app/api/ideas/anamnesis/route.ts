import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { parseAnamnesisHistory } from "@/lib/ideas/anamnesis";
import {
	generateIdeaFromAnamnesis,
	IdeaGenerationError,
} from "@/lib/llm/idea-generation";
import {
	completeAnamnesisSession,
	hasPaidAnamnesisSession,
} from "@/lib/wallet/service";

/**
 * Финальный подбор идеи по диалогу опроса. Оплата уже прошла на старте
 * (оплаченная сессия), поэтому здесь списания нет: генерируем идею нейросетью,
 * создаём её и помечаем сессию использованной.
 */
export async function POST(request: NextRequest) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) {
		return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
	}

	let body: { history?: unknown; sessionId?: unknown };
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
	}

	const history = parseAnamnesisHistory(body.history);
	if (!history || history.length === 0) {
		return NextResponse.json(
			{ error: "Ответьте хотя бы на один вопрос" },
			{ status: 400 },
		);
	}

	const userId = session.user.id;
	const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";

	// Проверяем оплату до обращения к нейросети — не тратим токены зря.
	const paid = await hasPaidAnamnesisSession({ userId, sessionId });
	if (!paid) {
		return NextResponse.json(
			{ error: "Сессия не оплачена", code: "unpaid" },
			{ status: 402 },
		);
	}

	let generated;
	try {
		generated = await generateIdeaFromAnamnesis({ userId, history });
	} catch (error) {
		const message =
			error instanceof IdeaGenerationError
				? error.message
				: "Не удалось подобрать идею";
		console.error("[ideas] ошибка генерации по анамнезу:", error);
		return NextResponse.json(
			{ error: `${message}. Оплата сохранена — попробуйте ещё раз.`, code: "generation" },
			{ status: 502 },
		);
	}

	const idea = await completeAnamnesisSession({
		userId,
		sessionId,
		title: generated.title,
		description: generated.description,
	});
	if (!idea) {
		return NextResponse.json(
			{ error: "Сессия уже использована", code: "used" },
			{ status: 409 },
		);
	}

	return NextResponse.json({ idea }, { status: 201 });
}
