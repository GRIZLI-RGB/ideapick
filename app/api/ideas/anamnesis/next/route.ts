import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { parseAnamnesisHistory } from "@/lib/ideas/anamnesis";
import {
	IdeaGenerationError,
	nextAnamnesisQuestion,
} from "@/lib/llm/idea-generation";
import { hasPaidAnamnesisSession } from "@/lib/wallet/service";

/**
 * Следующий шаг живого опроса: по текущему диалогу возвращает очередной вопрос
 * ИИ с вариантами ответа либо признак готовности подобрать идею. Доступно только
 * по оплаченной сессии (оплата проходит на старте) — вопросы не списываются
 * отдельно, но и не отдаются без предоплаты.
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
	if (!history) {
		return NextResponse.json({ error: "Некорректный диалог" }, { status: 400 });
	}

	const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
	const paid = await hasPaidAnamnesisSession({
		userId: session.user.id,
		sessionId,
	});
	if (!paid) {
		return NextResponse.json(
			{ error: "Сессия не оплачена", code: "unpaid" },
			{ status: 402 },
		);
	}

	try {
		const step = await nextAnamnesisQuestion({
			userId: session.user.id,
			history,
		});
		return NextResponse.json({ step });
	} catch (error) {
		const message =
			error instanceof IdeaGenerationError
				? error.message
				: "Не удалось получить вопрос";
		console.error("[ideas] ошибка шага опроса по анамнезу:", error);
		return NextResponse.json({ error: message }, { status: 502 });
	}
}
