"use client";

import { PANEL } from "@/components/ideas/detail/idea-detail-shared";
import { RadarChart } from "@/components/ideas/detail/visual/radar-chart";
import {
	ANALYSIS_STEP_MS,
	ANALYSIS_STEPS,
	RunningOverlay,
} from "@/components/ideas/detail/variants/analysis-progress-variants";
import { useIdeasDemo } from "@/components/ideas/ideas-demo-provider";
import { ScoreRing } from "@/components/ideas/score-ring";
import { RICH_RADAR_LABELS } from "@/lib/analysis/rich-types";
import { PRICES } from "@/lib/ideas/constants";
import type { Idea } from "@/lib/ideas/types";
import { Loader2, Lock, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

type IdeaDetailPendingProps = {
	idea: Idea;
	/** Вызывается после списания и «генерации» — отдаёт готовность отрисовать отчёт. */
	onAnalyzed: () => void;
};

/** Демо-профиль под размытием — намёк на готовый отчёт. */
const TEASER_RADAR = [0.72, 0.22, 0.45, 0.55, 0.78, 0.28];

export function IdeaDetailPending({
	idea,
	onAnalyzed,
}: IdeaDetailPendingProps) {
	const price = PRICES.analysis;
	const { balance, analyzeIdea, openWallet } = useIdeasDemo();
	const [loading, setLoading] = useState(false);
	const [charging, setCharging] = useState(false);
	const [step, setStep] = useState(0);

	const insufficient = balance < price;
	const busy = loading || charging;

	useEffect(() => {
		if (!loading) return;
		if (step >= ANALYSIS_STEPS.length - 1) {
			const done = window.setTimeout(onAnalyzed, ANALYSIS_STEP_MS);
			return () => window.clearTimeout(done);
		}
		const next = window.setTimeout(() => setStep((s) => s + 1), ANALYSIS_STEP_MS);
		return () => window.clearTimeout(next);
	}, [loading, step, onAnalyzed]);

	async function handleAnalyze() {
		if (busy) return;
		setCharging(true);
		const result = await analyzeIdea(idea.id);
		setCharging(false);
		if (result === "insufficient") {
			openWallet();
			return;
		}
		if (result !== "ok") return;
		setStep(0);
		setLoading(true);
	}

	if (loading) {
		return <RunningOverlay step={step} title={idea.title} />;
	}

	return (
		<div
			className={`relative overflow-hidden ${PANEL} min-h-88 sm:min-h-76`}
		>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 select-none blur-[6px]"
			>
				<div className="flex h-full flex-col justify-center gap-6 p-6 sm:flex-row sm:items-center sm:px-8">
					<div className="flex flex-1 items-center gap-4">
						<ScoreRing
							score={73}
							size="lg"
							ringClassName="stroke-amber-400"
							textClassName="text-amber-400"
						/>
						<div className="space-y-2">
							<div className="h-3 w-40 rounded bg-stone-700/70" />
							<div className="h-3 w-28 rounded bg-stone-800" />
							<div className="hidden h-3 w-52 rounded bg-stone-800/80 sm:block" />
						</div>
					</div>
					<div className="mx-auto h-40 w-full max-w-56 shrink-0 sm:mx-0 sm:h-44">
						<RadarChart
							values={TEASER_RADAR}
							labels={RICH_RADAR_LABELS}
							className="h-full w-full"
						/>
					</div>
				</div>
				<div className="absolute inset-x-0 bottom-0 space-y-2 px-6 pb-6 sm:px-8">
					<div className="h-3 w-full rounded bg-stone-800" />
					<div className="h-3 w-4/5 rounded bg-stone-800" />
				</div>
			</div>

			<div
				aria-hidden
				className="absolute inset-0 z-1 bg-stone-950/55 backdrop-blur-[2px]"
			/>

			<div className="relative z-10 flex min-h-88 items-center justify-center px-4 py-10 sm:min-h-76 sm:py-8">
				<div className="w-full max-w-sm rounded-2xl border border-stone-700/60 bg-stone-900/80 p-6 text-center shadow-2xl shadow-black/40">
					<div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-500/20">
						<Lock className="size-5 text-amber-400" />
					</div>
					<h2 className="mt-3.5 text-pretty text-base font-semibold leading-snug text-stone-100">
						Хотите провести анализ выбранной идеи?
					</h2>
					<p className="mt-1.5 text-sm text-stone-500">
						Анализ идеи займет меньше минуты
					</p>
					<button
						type="button"
						onClick={insufficient ? openWallet : handleAnalyze}
						disabled={charging}
						className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 disabled:cursor-not-allowed disabled:opacity-70"
					>
						{charging ? (
							<>
								<Loader2 className="size-4 animate-spin" />
								Запускаем…
							</>
						) : insufficient ? (
							<>
								<Wallet className="size-4" />
								Пополнить баланс
							</>
						) : (
							<>Запустить анализ · {price} ₽</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
