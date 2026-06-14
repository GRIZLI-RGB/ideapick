export type FactorTone = "strong" | "ok" | "poor";

export function toneFromLevel(level: number): FactorTone {
	if (level >= 71) return "strong";
	if (level >= 31) return "ok";
	return "poor";
}

export const TONE_BAR_CLASS: Record<FactorTone, string> = {
	strong: "bg-emerald-400",
	ok: "bg-amber-400",
	poor: "bg-rose-400",
};

export const TONE_TEXT_CLASS: Record<FactorTone, string> = {
	strong: "text-emerald-400",
	ok: "text-amber-400",
	poor: "text-rose-400",
};

export const RADAR_AXIS_LABELS = [
	"Спрос",
	"Конкуренция",
	"Деньги",
	"MVP",
	"Риски",
];
