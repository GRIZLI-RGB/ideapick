import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
	createTopUpPayment,
	TopUpValidationError,
} from "@/lib/wallet/service";

export async function POST(request: NextRequest) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) {
		return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
	}

	let body: { amount?: unknown; returnPath?: unknown };
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
	}

	const amount = Number(body.amount);
	const returnPath =
		typeof body.returnPath === "string" ? body.returnPath : "/app/ideas";

	try {
		const { confirmationUrl } = await createTopUpPayment({
			userId: session.user.id,
			amount,
			returnPath,
		});
		return NextResponse.json({ confirmationUrl });
	} catch (error) {
		if (error instanceof TopUpValidationError) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}
		console.error("[wallet] ошибка создания платежа:", error);
		return NextResponse.json(
			{ error: "Не удалось создать платёж. Попробуйте позже." },
			{ status: 502 },
		);
	}
}
