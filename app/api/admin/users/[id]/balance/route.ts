import { NextResponse, type NextRequest } from "next/server";
import {
	adjustUserBalance,
	AdminValidationError,
} from "@/lib/admin/service";
import { getAdminUser } from "@/lib/auth/admin";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const admin = await getAdminUser(request.headers);
	if (!admin) {
		return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
	}

	const { id } = await params;

	let body: { amount?: unknown; comment?: unknown };
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
	}

	const amount = typeof body.amount === "number" ? body.amount : NaN;
	const comment = typeof body.comment === "string" ? body.comment : undefined;

	try {
		const result = await adjustUserBalance({ userId: id, amount, comment });
		return NextResponse.json(result);
	} catch (error) {
		if (error instanceof AdminValidationError) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}
		console.error("[admin] ошибка корректировки баланса:", error);
		return NextResponse.json(
			{ error: "Не удалось изменить баланс. Попробуйте позже." },
			{ status: 500 },
		);
	}
}
