import type { LucideIcon } from "lucide-react";
import {
	AlertTriangle,
	Coins,
	ListChecks,
	Swords,
	Users,
	Wrench,
} from "lucide-react";

export type ReportSectionKey =
	| "demand"
	| "competition"
	| "monetization"
	| "execution"
	| "risks"
	| "nextSteps";

export const REPORT_SECTIONS: {
	key: ReportSectionKey;
	label: string;
	shortLabel: string;
	icon: LucideIcon;
}[] = [
	{ key: "demand", label: "Спрос и аудитория", shortLabel: "Спрос", icon: Users },
	{
		key: "competition",
		label: "Конкуренция",
		shortLabel: "Конкуренция",
		icon: Swords,
	},
	{ key: "monetization", label: "Монетизация", shortLabel: "Деньги", icon: Coins },
	{
		key: "execution",
		label: "Реализуемость",
		shortLabel: "Реализация",
		icon: Wrench,
	},
	{ key: "risks", label: "Риски", shortLabel: "Риски", icon: AlertTriangle },
	{
		key: "nextSteps",
		label: "Первые шаги",
		shortLabel: "Шаги",
		icon: ListChecks,
	},
];

export const SATURATION_LABEL: Record<string, string> = {
	low: "Низкая насыщенность",
	medium: "Средняя насыщенность",
	high: "Высокая насыщенность",
};

export const COMPLEXITY_LABEL: Record<string, string> = {
	low: "Низкая сложность MVP",
	medium: "Средняя сложность MVP",
	high: "Высокая сложность MVP",
};
