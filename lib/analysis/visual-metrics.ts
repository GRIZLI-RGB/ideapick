import type { AnalysisReport } from "@/lib/analysis/types";
import type { ReportSectionKey } from "@/lib/analysis/section-meta";

export type FactorTone = "strong" | "ok" | "weak" | "poor";

export type VisualFactor = {
	key: ReportSectionKey;
	level: number;
	tone: FactorTone;
	shortLabel: string;
};

export function toneFromLevel(level: number): FactorTone {
	if (level >= 71) return "strong";
	if (level >= 51) return "ok";
	if (level >= 31) return "weak";
	return "poor";
}

export const TONE_BAR_CLASS: Record<FactorTone, string> = {
	strong: "bg-emerald-400",
	ok: "bg-amber-400",
	weak: "bg-sky-400",
	poor: "bg-rose-400",
};

export const TONE_TEXT_CLASS: Record<FactorTone, string> = {
	strong: "text-emerald-400",
	ok: "text-amber-400",
	weak: "text-sky-400",
	poor: "text-rose-400",
};

const SATURATION_LEVEL = { low: 78, medium: 52, high: 28 } as const;
const COMPLEXITY_LEVEL = { low: 82, medium: 54, high: 30 } as const;

export function visualFactors(report: AnalysisReport): VisualFactor[] {
	const demandLevel = Math.min(100, Math.max(20, report.score + 8));
	const competitionLevel = SATURATION_LEVEL[report.competition.saturation];
	const monetizationLevel = Math.min(
		88,
		38 + report.monetization.bullets.length * 18,
	);
	const executionLevel = COMPLEXITY_LEVEL[report.execution.complexity];
	const riskLevel = Math.max(
		12,
		100 - report.risks.bullets.length * 22 - (report.score < 40 ? 10 : 0),
	);

	const items: Omit<VisualFactor, "tone">[] = [
		{ key: "demand", level: demandLevel, shortLabel: "Сильный" },
		{ key: "competition", level: competitionLevel, shortLabel: "Ниша" },
		{ key: "monetization", level: monetizationLevel, shortLabel: "Доход" },
		{ key: "execution", level: executionLevel, shortLabel: "MVP" },
		{ key: "risks", level: riskLevel, shortLabel: "Безопасность" },
	];

	return items.map((item) => ({
		...item,
		tone: toneFromLevel(item.level),
		shortLabel:
			item.level >= 71
				? "Высокий"
				: item.level >= 51
					? "Средний"
					: item.level >= 31
						? "Ниже среднего"
						: "Низкий",
	}));
}

export function radarValues(report: AnalysisReport): number[] {
	return visualFactors(report).map((f) => f.level / 100);
}

export const RADAR_AXIS_LABELS = [
	"Спрос",
	"Конкуренция",
	"Деньги",
	"MVP",
	"Риски",
];
