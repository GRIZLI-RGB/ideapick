import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getAdminUser } from "@/lib/auth/admin";

/** Бан/разбан пользователя через better-auth admin API (отзывает сессии). */
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const admin = await getAdminUser(request.headers);
	if (!admin) {
		return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
	}

	const { id } = await params;

	if (id === admin.id) {
		return NextResponse.json(
			{ error: "Нельзя заблокировать самого себя" },
			{ status: 400 },
		);
	}

	let body: { banned?: unknown; reason?: unknown };
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
	}

	const banned = body.banned === true;
	const reason =
		typeof body.reason === "string" && body.reason.trim()
			? body.reason.trim()
			: undefined;

	try {
		if (banned) {
			await auth.api.banUser({
				headers: request.headers,
				body: { userId: id, banReason: reason },
			});
		} else {
			await auth.api.unbanUser({
				headers: request.headers,
				body: { userId: id },
			});
		}
		return NextResponse.json({ banned });
	} catch (error) {
		console.error("[admin] ошибка бана пользователя:", error);
		return NextResponse.json(
			{ error: "Не удалось изменить статус блокировки." },
			{ status: 500 },
		);
	}
}
