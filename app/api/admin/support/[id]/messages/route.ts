import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { addMessage, SupportValidationError } from "@/lib/support/service";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const admin = await getAdminUser(request.headers);
	if (!admin) {
		return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
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
			author: "support",
			body: typeof body.body === "string" ? body.body : "",
		});
		return NextResponse.json({ ticket });
	} catch (error) {
		if (error instanceof SupportValidationError) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}
		console.error("[admin] ошибка ответа поддержки:", error);
		return NextResponse.json(
			{ error: "Не удалось отправить ответ. Попробуйте позже." },
			{ status: 500 },
		);
	}
}
