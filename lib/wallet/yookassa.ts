import "server-only";

const API_BASE = "https://api.yookassa.ru/v3";

const shopId = process.env.YOOKASSA_SHOP_ID;
const secretKey = process.env.YOOKASSA_SECRET_KEY;

/**
 * Настроена ли ЮKassa. Если ключей нет — система работает в локальном
 * test-режиме (платёж имитируется без обращения к внешнему API), что удобно
 * для разработки. В проде ключи обязательны.
 */
export function isYookassaConfigured(): boolean {
	return Boolean(shopId && secretKey);
}

export type YookassaStatus =
	| "pending"
	| "waiting_for_capture"
	| "succeeded"
	| "canceled";

export type YookassaPayment = {
	id: string;
	status: YookassaStatus;
	paid: boolean;
	amount: { value: string; currency: string };
	confirmation?: { type: string; confirmation_url?: string };
	metadata?: Record<string, string>;
};

function authHeader(): string {
	return `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString("base64")}`;
}

/** Сумма в рублях (целое) → строка для ЮKassa: 100 → "100.00". */
function formatAmount(rubles: number): string {
	return `${rubles}.00`;
}

type CreatePaymentArgs = {
	amountRubles: number;
	description: string;
	idempotenceKey: string;
	returnUrl: string;
	metadata: Record<string, string>;
};

export async function createYookassaPayment({
	amountRubles,
	description,
	idempotenceKey,
	returnUrl,
	metadata,
}: CreatePaymentArgs): Promise<YookassaPayment> {
	const res = await fetch(`${API_BASE}/payments`, {
		method: "POST",
		headers: {
			Authorization: authHeader(),
			"Idempotence-Key": idempotenceKey,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			amount: { value: formatAmount(amountRubles), currency: "RUB" },
			capture: true,
			confirmation: { type: "redirect", return_url: returnUrl },
			description,
			metadata,
		}),
	});

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`ЮKassa create payment failed (${res.status}): ${text}`);
	}

	return (await res.json()) as YookassaPayment;
}

export async function getYookassaPayment(
	providerPaymentId: string,
): Promise<YookassaPayment> {
	const res = await fetch(`${API_BASE}/payments/${providerPaymentId}`, {
		headers: { Authorization: authHeader() },
	});

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`ЮKassa get payment failed (${res.status}): ${text}`);
	}

	return (await res.json()) as YookassaPayment;
}
