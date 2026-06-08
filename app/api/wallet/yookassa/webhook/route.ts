import { NextResponse, type NextRequest } from "next/server";
import { capturePayment } from "@/lib/wallet/service";

/**
 * Вебхук ЮKassa. Для надёжности (на случай, если пользователь не вернулся на
 * сайт) фиксирует платёж по уведомлению. capturePayment повторно сверяет статус
 * во внешнем API и идемпотентен, поэтому даже подделанное уведомление не
 * приведёт к ложному зачислению.
 */
export async function POST(request: NextRequest) {
	let body: {
		event?: string;
		object?: { id?: string; metadata?: Record<string, string> };
	};
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ ok: false }, { status: 400 });
	}

	const paymentId = body.object?.metadata?.paymentId;
	if (!paymentId) {
		// Нет нашего идентификатора — игнорируем, но отвечаем 200, чтобы ЮKassa
		// не повторяла бесконечно.
		return NextResponse.json({ ok: true });
	}

	try {
		await capturePayment(paymentId);
	} catch (error) {
		console.error("[wallet] ошибка обработки вебхука ЮKassa:", error);
		// 500 — ЮKassa повторит уведомление позже.
		return NextResponse.json({ ok: false }, { status: 500 });
	}

	return NextResponse.json({ ok: true });
}
