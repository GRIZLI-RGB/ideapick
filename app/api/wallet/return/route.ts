import { NextResponse, type NextRequest } from "next/server";
import { capturePayment } from "@/lib/wallet/service";

/**
 * Куда ЮKassa (и test-режим) возвращает пользователя после оплаты.
 * Сверяет статус платежа, при успехе зачисляет средства и редиректит обратно
 * на страницу, с которой инициировано пополнение, с пометкой результата.
 */
export async function GET(request: NextRequest) {
	const paymentId = request.nextUrl.searchParams.get("paymentId");
	if (!paymentId) {
		return NextResponse.redirect(new URL("/app/ideas", request.url));
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

	const target = new URL(returnPath, request.url);
	const flag =
		status === "succeeded"
			? "success"
			: status === "canceled"
				? "canceled"
				: "pending";
	target.searchParams.set("topup", flag);
	return NextResponse.redirect(target);
}
