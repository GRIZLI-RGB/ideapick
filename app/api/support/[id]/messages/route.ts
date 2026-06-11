import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { addMessage, SupportValidationError } from "@/lib/support/service";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) {
		return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
	}

	const { id } = await params;

	let body: { body?: unknown };
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
	}

	try {
		const ticket = await addMessage({
			ticketId: id,
			author: "user",
			userId: session.user.id,
			body: typeof body.body === "string" ? body.body : "",
		});
		return NextResponse.json({ ticket });
	} catch (error) {
		if (error instanceof SupportValidationError) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}
		console.error("[support] ошибка ответа в обращении:", error);
		return NextResponse.json(
			{ error: "Не удалось отправить сообщение. Попробуйте позже." },
			{ status: 500 },
		);
	}
}
