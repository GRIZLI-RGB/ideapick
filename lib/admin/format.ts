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
