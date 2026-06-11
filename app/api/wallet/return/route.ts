import { NextResponse, type NextRequest } from "next/server";
import { capturePayment } from "@/lib/wallet/service";

/**
 * База для redirect-URL. В standalone-режиме request.url содержит адрес,
 * на котором слушает сервер (http://0.0.0.0:3000), поэтому берём публичный
 * URL из окружения.
 */
function redirectBase(request: NextRequest): string {
	return (
		process.env.NEXT_PUBLIC_APP_URL ??
		process.env.BETTER_AUTH_URL ??
		request.url
	);
}

/**
 * Куда ЮKassa (и test-режим) возвращает пользователя после оплаты.
 * Сверяет статус платежа, при успехе зачисляет средства и редиректит обратно
 * на страницу, с которой инициировано пополнение, с пометкой результата.
 */
export async function GET(request: NextRequest) {
	const paymentId = request.nextUrl.searchParams.get("paymentId");
	if (!paymentId) {
		return NextResponse.redirect(new URL("/app/ideas", redirectBase(request)));
	}

	let status: string = "pending";
	let returnPath = "/app/ideas";
	try {
		const result = await capturePayment(paymentId);
		status = result.status;
		returnPath = result.returnPath;
	} catch (error) {
		console.error("[wallet] ошибка фиксации платежа:", error);
	}

	const target = new URL(returnPath, redirectBase(request));
	const flag =
		status === "succeeded"
			? "success"
			: status === "canceled"
				? "canceled"
				: "pending";
	target.searchParams.set("topup", flag);
	return NextResponse.redirect(target);
}
