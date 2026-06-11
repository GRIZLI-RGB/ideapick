import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { deleteIdea, setIdeaArchived } from "@/lib/ideas/service";

/** Архивирование / возврат из архива: { archived: boolean }. */
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) {
		return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
	}

	const { id } = await params;

	let body: { archived?: unknown };
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
	}

	if (typeof body.archived !== "boolean") {
		return NextResponse.json(
			{ error: "Ожидается поле archived (boolean)" },
			{ status: 400 },
		);
	}

	try {
		const idea = await setIdeaArchived({
			userId: session.user.id,
			ideaId: id,
			archived: body.archived,
		});
		if (!idea) {
			return NextResponse.json({ error: "Идея не найдена" }, { status: 404 });
		}
		return NextResponse.json({ idea });
	} catch (error) {
		console.error("[ideas] ошибка архивирования идеи:", error);
		return NextResponse.json(
			{ error: "Не удалось обновить идею. Попробуйте позже." },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) {
		return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
	}

	const { id } = await params;

	try {
		const removed = await deleteIdea({ userId: session.user.id, ideaId: id });
		if (!removed) {
			return NextResponse.json({ error: "Идея не найдена" }, { status: 404 });
		}
		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error("[ideas] ошибка удаления идеи:", error);
		return NextResponse.json(
			{ error: "Не удалось удалить идею. Попробуйте позже." },
			{ status: 500 },
		);
	}
}
