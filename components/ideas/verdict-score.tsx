"use client";

import type { Idea } from "@/lib/ideas/types";
import type { Verdict } from "@/lib/ideas/types";
import { VERDICTS } from "@/lib/ideas/constants";
import { ScorePlaceholder, ScoreRing } from "@/components/ideas/score-ring";

function verdictStyles(verdict: Verdict | null) {
	if (!verdict) {
		return { ring: "stroke-amber-400", text: "text-stone-300" };
	}
	const v = VERDICTS[verdict];
	return { ring: v.ring, text: v.color };
}

type VerdictScoreRingProps = {
	idea: Idea;
	size?: "sm" | "md" | "lg";
};

export function VerdictScoreRing({ idea, size = "md" }: VerdictScoreRingProps) {
	if (!idea.hasAnalysis || idea.score == null) {
		return <ScorePlaceholder size={size} />;
	}
	const s = verdictStyles(idea.verdict);
	return (
		<ScoreRing
			score={idea.score}
			size={size}
			ringClassName={s.ring}
			textClassName={s.text}
		/>
	);
}
