export function formatAnalyzedAt(iso: string) {
	return new Intl.DateTimeFormat("ru-RU", {
		day: "numeric",
		month: "long",
		year: "numeric",
	}).format(new Date(iso));
}

export const PANEL =
	"rounded-2xl border border-stone-800/60 bg-stone-900/40";
