// Транслитерация кириллицы в латиницу для человекочитаемых URL статей.
// Используется и на сервере (сохранение), и в клиенте (превью слага),
// поэтому модуль не помечен server-only.

const TRANSLIT: Record<string, string> = {
	а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
	з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
	п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
	ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu",
	я: "ya",
};

export const SLUG_MAX = 96;

/**
 * Превращает заголовок (или произвольный текст) в URL-слаг:
 * транслит кириллицы, нижний регистр, дефисы вместо пробелов/символов.
 */
export function slugify(input: string): string {
	const lower = input.trim().toLowerCase();
	let out = "";
	for (const ch of lower) {
		if (ch in TRANSLIT) {
			out += TRANSLIT[ch];
		} else if (/[a-z0-9]/.test(ch)) {
			out += ch;
		} else {
			out += "-";
		}
	}
	return out
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, SLUG_MAX)
		.replace(/-$/g, "");
}

/** Допустимый слаг: латиница, цифры и дефисы, не пустой. */
export function isValidSlug(slug: string): boolean {
	return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= SLUG_MAX;
}

/** Оценка времени чтения в минутах по объёму текста (≈180 слов/мин). */
export function estimateReadingMinutes(markdown: string): number {
	const words = markdown.trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / 180));
}
