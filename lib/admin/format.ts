export function formatDateTime(iso: string): string {
	return new Intl.DateTimeFormat("ru-RU", {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(iso));
}

export function formatRub(amount: number): string {
	return `${new Intl.NumberFormat("ru-RU").format(amount)} ₽`;
}

/** Стоимость из микро-долларов (1e-6 USD) в читаемую строку. */
export function formatUsd(microUsd: number): string {
	const usd = microUsd / 1_000_000;
	if (usd === 0) return "$0";
	if (usd < 0.01) return `$${usd.toFixed(5)}`;
	return `$${usd.toFixed(2)}`;
}

export function formatTokens(value: number): string {
	return new Intl.NumberFormat("ru-RU").format(value);
}
