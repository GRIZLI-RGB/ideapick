import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { setTicketStatus, SupportValidationError } from "@/lib/support/service";

/** Пользователь может только закрыть собственное обращение. */
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) {
		return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
	}

	const { id } = await params;

	let body: { status?: unknown };
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
	}

	if (body.status !== "closed") {
		return NextResponse.json({ error: "Недопустимый статус" }, { status: 400 });
	}

	try {
		const ticket = await setTicketStatus({
			ticketId: id,
			status: "closed",
			userId: session.user.id,
		});
		return NextResponse.json({ ticket });
	} catch (error) {
		if (error instanceof SupportValidationError) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}
		console.error("[support] ошибка закрытия обращения:", error);
		return NextResponse.json(
			{ error: "Не удалось закрыть обращение. Попробуйте позже." },
			{ status: 500 },
		);
	}
}
