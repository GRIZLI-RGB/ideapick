/** Дата публикации статьи в формате «27 июня 2026». */
export function formatArticleDate(iso: string): string {
	return new Intl.DateTimeFormat("ru-RU", {
		day: "numeric",
		month: "long",
		year: "numeric",
	}).format(new Date(iso));
}
