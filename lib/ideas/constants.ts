import type { Verdict } from "@/lib/ideas/types";

export const PRICES = {
	analysis: 99,
	anamnesis: 49,
	welcomeBonus: 100,
} as const;

export const RANDOM_DAILY_LIMIT = 3;

export const VERDICTS: Record<
	Verdict,
	{ label: string; short: string; color: string; bg: string; ring: string }
> = {
	do: {
		label: "Делать",
		short: "Делать",
		color: "text-emerald-400",
		bg: "bg-emerald-500/10 ring-emerald-500/20",
		ring: "stroke-emerald-400",
	},
	test: {
		label: "Проверять",
		short: "Проверять",
		color: "text-amber-400",
		bg: "bg-amber-500/10 ring-amber-500/20",
		ring: "stroke-amber-400",
	},
	wait: {
		label: "Отложить",
		short: "Отложить",
		color: "text-sky-400",
		bg: "bg-sky-500/10 ring-sky-500/20",
		ring: "stroke-sky-400",
	},
	skip: {
		label: "Отказаться",
		short: "Отказ",
		color: "text-rose-400",
		bg: "bg-rose-500/10 ring-rose-500/20",
		ring: "stroke-rose-400",
	},
};
