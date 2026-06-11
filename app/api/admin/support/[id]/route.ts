import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import {
	setTicketStatus,
	SupportValidationError,
} from "@/lib/support/service";
import type { SupportTicketStatus } from "@/lib/support/types";

const VALID_STATUSES = new Set<SupportTicketStatus>([
	"open",
	"in_progress",
	"answered",
	"closed",
]);

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const admin = await getAdminUser(request.headers);
	if (!admin) {
		return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
	}

	const { id } = await params;

	let body: { status?: unknown };
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
	}

	const status = body.status as SupportTicketStatus;
	if (typeof status !== "string" || !VALID_STATUSES.has(status)) {
		return NextResponse.json({ error: "Недопустимый статус" }, { status: 400 });
	}

	try {
		const ticket = await setTicketStatus({ ticketId: id, status });
		return NextResponse.json({ ticket });
	} catch (error) {
		if (error instanceof SupportValidationError) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}
		console.error("[admin] ошибка смены статуса тикета:", error);
		return NextResponse.json(
			{ error: "Не удалось изменить статус. Попробуйте позже." },
			{ status: 500 },
		);
	}
}
