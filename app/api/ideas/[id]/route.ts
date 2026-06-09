import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { deleteIdea } from "@/lib/ideas/service";

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
