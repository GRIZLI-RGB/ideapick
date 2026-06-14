import {
	IDEA_DESCRIPTION_GOOD,
	IDEA_DESCRIPTION_MIN,
	IDEA_TITLE_MIN,
} from "@/lib/ideas/validation";
import type { FactorTone } from "@/lib/analysis/visual-metrics";

/** Пороги превалидации — см. docs/analysis.md */
export const INPUT_QUALITY_GOOD = 60;
export const INPUT_QUALITY_WARN = 40;

export type InputQualityMeta = {
	short: string;
	label: string;
	tone: FactorTone;
	bar: string;
	text: string;
};

export function inputQualityMeta(quality: number): InputQualityMeta {
	const q = Math.min(100, Math.max(0, Math.round(quality)));

	if (q >= INPUT_QUALITY_GOOD) {
		return {
			short: "Высокая",
			label: "Высокая детализация. Идея описана подробно — AI учёл все нюансы.",
			tone: "strong",
			bar: "bg-emerald-400",
			text: "text-emerald-400/90",
		};
	}
	if (q >= INPUT_QUALITY_WARN) {
		return {
			short: "Средняя",
			label: "Средняя детализация. Описание краткое, часть выводов сделана в общих чертах.",
			tone: "ok",
			bar: "bg-amber-400",
			text: "text-amber-400/90",
		};
	}
	return {
		short: "Низкая",
		label: "Низкая детализация. Слишком мало данных — отчёт носит приблизительный характер.",
		tone: "poor",
		bar: "bg-rose-400",
		text: "text-rose-400/90",
	};
}

/** Демо-оценка до реальной AI-превалидации: длина и «полнота» названия/описания. */
export function estimateInputQuality(
	title: string,
	description: string,
): number {
	const t = title.trim();
	const d = description.trim();

	let score = 34;

	score += Math.min(16, Math.max(0, (t.length - IDEA_TITLE_MIN) * 1.1));
	score += Math.min(42, Math.max(0, (d.length - IDEA_DESCRIPTION_MIN) * 0.14));

	if (d.length >= IDEA_DESCRIPTION_GOOD) score += 14;
	if (t.length >= 20 && d.length >= 200) score += 6;

	return Math.min(100, Math.round(score));
}
