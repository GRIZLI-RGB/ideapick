/**
 * Лимиты полей идеи — общие для клиента (форма, индикаторы) и сервера
 * (валидация в service). Единственный источник правды по min/max.
 */
export const IDEA_TITLE_MIN = 3;
export const IDEA_TITLE_MAX = 100;
export const IDEA_DESCRIPTION_MIN = 20;
export const IDEA_DESCRIPTION_MAX = 600;

/**
 * Пороги «хорошего» заполнения для индикатора (не блокируют отправку):
 * ниже min — красный, от min до good — жёлтый, от good — зелёный.
 */
export const IDEA_TITLE_GOOD = 12;
export const IDEA_DESCRIPTION_GOOD = 120;

/** 0 — пусто, 1 — не хватает, 2 — достаточно, 3 — хорошо. */
export type FillLevel = 0 | 1 | 2 | 3;

export function getFillLevel(
	length: number,
	min: number,
	good: number,
): FillLevel {
	if (length === 0) return 0;
	if (length < min) return 1;
	if (length < good) return 2;
	return 3;
}
