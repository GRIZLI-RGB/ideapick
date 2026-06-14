import type { LucideIcon } from "lucide-react";
import {
	AlertTriangle,
	Ban,
	Coins,
	FlaskConical,
	GitFork,
	Megaphone,
	Rocket,
	Swords,
	Users,
	Wrench,
} from "lucide-react";
import type { Complexity, Saturation } from "@/lib/analysis/types";

export type Confidence = "low" | "medium" | "high";

/** Решение по идее — главный смысл отчёта, а не просто балл. */
export type Verdict = "build" | "simplify_test" | "pivot" | "drop";

export type RichAxisKey =
	| "demand"
	| "competition"
	| "monetization"
	| "distribution"
	| "execution"
	| "risks";

/** Ось с РЕАЛЬНОЙ суб-оценкой (источник радара) и собственной уверенностью. */
export type RichAxis = {
	score: number;
	confidence: Confidence;
	bullets: string[];
	audience?: string;
	saturation?: Saturation;
	complexity?: Complexity;
	soloWeeks?: number;
};

export type AssumptionTest = {
	action: string;
	channel: string;
	metric: string;
	threshold: string;
	timeframe: string;
};

export type KillerAssumption = {
	statement: string;
	why: string;
	test: AssumptionTest;
};

export type RichAnalysisReport = {
	score: number;
	confidence: Confidence;
	verdict: Verdict;
	verdictLine: string;
	/** 0–100: насколько детально описана идея (превалидация). Влияет на точность отчёта. */
	inputQuality: number;
	summary: string;
	scoreRationale: string;
	analyzedAt: string;
	/** Номер запуска анализа: 1 — первый, 2+ — обновления. */
	version: number;
	axes: Record<RichAxisKey, RichAxis>;
	killerAssumption: KillerAssumption;
	nextSteps: string[];
};

export const VERDICT_META: Record<
	Verdict,
	{
		label: string;
		icon: LucideIcon;
		badge: string;
		text: string;
		dot: string;
		glow: string;
	}
> = {
	build: {
		label: "Стоит браться",
		icon: Rocket,
		badge: "border-emerald-500/30 bg-emerald-500/10",
		text: "text-emerald-300",
		dot: "bg-emerald-400",
		glow: "from-emerald-500/10",
	},
	simplify_test: {
		label: "Упростить и проверить",
		icon: FlaskConical,
		badge: "border-amber-500/30 bg-amber-500/10",
		text: "text-amber-300",
		dot: "bg-amber-400",
		glow: "from-amber-500/10",
	},
	pivot: {
		label: "Нужен разворот",
		icon: GitFork,
		badge: "border-sky-500/30 bg-sky-500/10",
		text: "text-sky-300",
		dot: "bg-sky-400",
		glow: "from-sky-500/10",
	},
	drop: {
		label: "Лучше не браться",
		icon: Ban,
		badge: "border-rose-500/30 bg-rose-500/10",
		text: "text-rose-300",
		dot: "bg-rose-400",
		glow: "from-rose-500/10",
	},
};

export const CONFIDENCE_META: Record<
	Confidence,
	{ label: string; short: string; dot: string; text: string }
> = {
	low: {
		label: "Низкая уверенность",
		short: "Уверенность низкая",
		dot: "bg-rose-400/80",
		text: "text-rose-300/90",
	},
	medium: {
		label: "Средняя уверенность",
		short: "Уверенность средняя",
		dot: "bg-amber-400/80",
		text: "text-amber-300/90",
	},
	high: {
		label: "Высокая уверенность",
		short: "Уверенность высокая",
		dot: "bg-emerald-400/80",
		text: "text-emerald-300/90",
	},
};

/** Мета осей ядра. Собственная (не общий REPORT_SECTIONS), чтобы новые оси
 *  не задевали легаси-отчёт и лендинг. Порядок = порядок карточек и радара. */
export const RICH_AXES: {
	key: RichAxisKey;
	label: string;
	short: string;
	icon: LucideIcon;
}[] = [
	{ key: "demand", label: "Спрос и аудитория", short: "Спрос", icon: Users },
	{ key: "competition", label: "Конкуренция", short: "Конкуренция", icon: Swords },
	{ key: "monetization", label: "Монетизация", short: "Монетизация", icon: Coins },
	{
		key: "distribution",
		label: "Каналы продвижения",
		short: "Продвижение",
		icon: Megaphone,
	},
	{ key: "execution", label: "Реализуемость", short: "Реализация", icon: Wrench },
	{ key: "risks", label: "Риски", short: "Риски", icon: AlertTriangle },
];

export const RICH_RADAR_KEYS: RichAxisKey[] = RICH_AXES.map((a) => a.key);
export const RICH_RADAR_LABELS: string[] = RICH_AXES.map((a) => a.short);

export function richRadarValues(report: RichAnalysisReport): number[] {
	return RICH_RADAR_KEYS.map((k) => report.axes[k].score / 100);
}

export function formatAnalysisVersion(version: number): string {
	return `Версия ${version}`;
}
