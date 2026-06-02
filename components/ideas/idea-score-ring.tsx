"use client";

import type { Idea } from "@/lib/ideas/types";
import { scoreStyles } from "@/lib/ideas/score-style";
import { ScorePlaceholder, ScoreRing } from "@/components/ideas/score-ring";

type IdeaScoreRingProps = {
	idea: Idea;
	size?: "sm" | "md" | "lg";
};

export function IdeaScoreRing({ idea, size = "md" }: IdeaScoreRingProps) {
	if (!idea.hasAnalysis || idea.score == null) {
		return <ScorePlaceholder size={size} />;
	}

	const s = scoreStyles(idea.score);
	return (
		<ScoreRing
			score={idea.score}
			size={size}
			ringClassName={s.ring}
			textClassName={s.text}
		/>
	);
}
