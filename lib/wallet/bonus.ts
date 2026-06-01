export const TOP_UP_MIN = 100;
export const TOP_UP_MAX = 100_000;

/** Пороги бонуса при пополнении (демо; не суммируются) */
export const TOP_UP_BONUS_TIERS = [
	{ from: 500, label: "+5% к сумме" },
	{ from: 2_000, label: "+7% к сумме" },
	{ from: 10_000, label: "+10%, бонус до 1 500 ₽" },
] as const;

const BONUS_CAP = 1_500;

/**
 * Умеренные бонусы: заметны от 500 ₽, на крупных суммах ограничены потолком.
 */
export function calcTopUpBonus(amount: number): number {
	if (amount < 500) return 0;
	if (amount < 2_000) return Math.floor(amount * 0.05);
	if (amount < 10_000) return Math.floor(amount * 0.07);
	return Math.min(Math.floor(amount * 0.1), BONUS_CAP);
}

export function calcTopUpTotal(amount: number): number {
	return amount + calcTopUpBonus(amount);
}
