import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { deleteCatalogIdea } from "@/lib/ideas/catalog";

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const admin = await getAdminUser(request.headers);
	if (!admin) {
		return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
	}

	const { id } = await params;

	try {
		const removed = await deleteCatalogIdea(id);
		if (!removed) {
			return NextResponse.json(
				{ error: "Идея не найдена или уже выдана пользователю" },
				{ status: 404 },
			);
		}
		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error("[admin] ошибка удаления идеи каталога:", error);
		return NextResponse.json(
			{ error: "Не удалось удалить идею. Попробуйте позже." },
			{ status: 500 },
		);
	}
}
