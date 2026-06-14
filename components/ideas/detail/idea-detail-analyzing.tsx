"use client";

import {
	ANALYSIS_STEP_MS,
	ANALYSIS_STEPS,
	RunningOverlay,
} from "@/components/ideas/detail/variants/analysis-progress-variants";
import { useEffect, useState } from "react";

type IdeaDetailAnalyzingProps = {
	title: string;
	/** После прохождения всех шагов «генерации». */
	onComplete: () => void;
};

/** Оверлей с прогрессом — общий для первого запуска и обновления анализа. */
export function IdeaDetailAnalyzing({
	title,
	onComplete,
}: IdeaDetailAnalyzingProps) {
	const [step, setStep] = useState(0);

	useEffect(() => {
		if (step >= ANALYSIS_STEPS.length - 1) {
			const done = window.setTimeout(onComplete, ANALYSIS_STEP_MS);
			return () => window.clearTimeout(done);
		}
		const next = window.setTimeout(() => setStep((s) => s + 1), ANALYSIS_STEP_MS);
		return () => window.clearTimeout(next);
	}, [step, onComplete]);

	return <RunningOverlay step={step} title={title} />;
}
