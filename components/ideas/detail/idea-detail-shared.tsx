"use client";

import type { AnalysisReport } from "@/lib/analysis/types";
import { scoreStyles } from "@/lib/ideas/score-style";
import { ScoreRing } from "@/components/ideas/score-ring";
import { Calendar, Sparkles } from "lucide-react";

export function formatAnalyzedAt(iso: string) {
	return new Intl.DateTimeFormat("ru-RU", {
		day: "numeric",
		month: "long",
		year: "numeric",
	}).format(new Date(iso));
}

type ScoreHeroProps = {
	score: number;
	size?: "md" | "lg";
	showLabel?: boolean;
};

export function ScoreHero({ score, size = "lg", showLabel = true }: ScoreHeroProps) {
	const s = scoreStyles(score);
	return (
		<div className="flex items-center gap-4">
			<ScoreRing
				score={score}
				size={size}
				ringClassName={s.ring}
				textClassName={s.text}
			/>
			{showLabel ? (
				<div>
					<p className="flex items-center gap-1.5 text-xs font-medium text-stone-400">
						<Sparkles className="size-3.5 text-amber-400/90" />
						Оценка идеи
					</p>
					<p className="mt-0.5 text-sm text-stone-500">из 100 · AI-анализ</p>
				</div>
			) : null}
		</div>
	);
}

type AnalysisMetaProps = {
	report: AnalysisReport;
};

export function AnalysisMeta({ report }: AnalysisMetaProps) {
	return (
		<p className="flex items-center gap-1.5 text-xs text-stone-500">
			<Calendar className="size-3.5 shrink-0" />
			Анализ от {formatAnalyzedAt(report.analyzedAt)}
		</p>
	);
}

type BulletListProps = {
	items: string[];
};

export function BulletList({ items }: BulletListProps) {
	return (
		<ul className="space-y-2">
			{items.map((item, i) => (
				<li
					key={i}
					className="flex gap-2.5 text-sm leading-relaxed text-stone-300"
				>
					<span className="mt-2 size-1 shrink-0 rounded-full bg-amber-500/70" />
					<span>{item}</span>
				</li>
			))}
		</ul>
	);
}

export const PANEL =
	"rounded-2xl border border-stone-800/60 bg-stone-900/40";
