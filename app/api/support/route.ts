import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { createTicket, SupportValidationError } from "@/lib/support/service";

export async function POST(request: NextRequest) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) {
		return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
	}

	let body: { subject?: unknown; body?: unknown };
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
	}

	const subject = typeof body.subject === "string" ? body.subject : "";
	const text = typeof body.body === "string" ? body.body : "";

	try {
		const ticket = await createTicket({
			userId: session.user.id,
			subject,
			body: text,
		});
		return NextResponse.json({ ticket }, { status: 201 });
	} catch (error) {
		if (error instanceof SupportValidationError) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}
		console.error("[support] ошибка создания обращения:", error);
		return NextResponse.json(
			{ error: "Не удалось создать обращение. Попробуйте позже." },
			{ status: 500 },
		);
	}
}
