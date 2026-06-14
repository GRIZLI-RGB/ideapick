"use client";

import { PANEL } from "@/components/ideas/detail/idea-detail-shared";
import { RadarChart } from "@/components/ideas/detail/visual/radar-chart";
import { ScoreRing } from "@/components/ideas/score-ring";
import { RICH_RADAR_LABELS } from "@/lib/analysis/rich-types";
import { motion } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";

/* ── Общие константы (как в prod) ─────────────────────────────────────── */

export const ANALYSIS_STEPS = [
	"Валидируем идею",
	"Изучаем рынок",
	"Формируем отчёт",
] as const;

export const ANALYSIS_STEP_MS = 1000;
const TEASER_RADAR = [0.72, 0.22, 0.45, 0.55, 0.78, 0.28];
const EASE = [0.22, 1, 0.36, 1] as const;

type RunningProps = {
	step: number;
	title: string;
};

/* ── Фон тизера (размытый отчёт) ─────────────────────────────────────── */

function TeaserBackground({ blur = 6 }: { blur?: number }) {
	return (
		<div
			aria-hidden
			className="pointer-events-none absolute inset-0 select-none"
			style={{ filter: blur > 0 ? `blur(${blur}px)` : undefined }}
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
	);
}

function TeaserShell({
	children,
	blur = 6,
	dim = 0.55,
}: {
	children: React.ReactNode;
	blur?: number;
	dim?: number;
}) {
	return (
		<div
			className={`relative overflow-hidden ${PANEL} min-h-88 sm:min-h-76`}
		>
			<TeaserBackground blur={blur} />
			<div
				aria-hidden
				className="absolute inset-0 z-1 backdrop-blur-[2px]"
				style={{ backgroundColor: `rgb(12 10 9 / ${dim})` }}
			/>
			<div className="relative z-10 flex min-h-88 items-center justify-center px-4 py-10 sm:min-h-76 sm:py-8">
				{children}
			</div>
		</div>
	);
}

/* ── Оверлей с прогрессом на тизере — фон остаётся ─────────────────────── */

export function RunningOverlay({ step, title }: RunningProps) {
	const progress = ((step + 1) / ANALYSIS_STEPS.length) * 100;

	return (
		<TeaserShell blur={4} dim={0.65}>
			<div className="flex w-full max-w-md flex-col gap-4">
				<div className="rounded-2xl border border-stone-700/60 bg-stone-900/90 p-5 shadow-xl shadow-black/30">
					<div className="flex items-center gap-3">
						<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-500/20">
							<Sparkles className="size-5 text-amber-400" />
						</div>
						<div className="min-w-0 text-left">
							<p className="text-sm font-semibold text-stone-100">
								Анализируем идею
							</p>
							<p className="truncate text-xs text-stone-500">
								«{title}»
							</p>
						</div>
					</div>
					<div className="mt-4 h-1.5 overflow-hidden rounded-full bg-stone-800">
						<motion.div
							className="h-full rounded-full bg-amber-400"
							animate={{ width: `${progress}%` }}
							transition={{ duration: 0.45, ease: EASE }}
						/>
					</div>
					<div className="mt-4">
						<StepList step={step} layout="left" />
					</div>
				</div>
			</div>
		</TeaserShell>
	);
}

/* ── Общие части ─────────────────────────────────────────────────────── */

type StepState = "done" | "active" | "idle";

function StepIcon({ state }: { state: StepState }) {
	if (state === "done") {
		return (
			<span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-500/30">
				<Check className="size-2.5 text-emerald-400" />
			</span>
		);
	}
	if (state === "active") {
		return (
			<Loader2 className="size-4 shrink-0 animate-spin text-amber-400" />
		);
	}
	return (
		<span className="size-4 shrink-0 rounded-full border border-stone-700" />
	);
}

function StepList({
	step,
	layout,
}: {
	step: number;
	layout: "center" | "left";
}) {
	return (
		<ul
			className={`mt-5 flex flex-col gap-2 ${
				layout === "center"
					? "mx-auto max-w-sm items-center"
					: "items-start"
			}`}
		>
			{ANALYSIS_STEPS.map((label, i) => {
				const state: StepState =
					i < step ? "done" : i === step ? "active" : "idle";
				return (
					<li
						key={label}
						className={`flex items-center gap-2.5 text-sm transition ${
							state === "idle"
								? "text-stone-600"
								: state === "active"
									? "text-stone-200"
									: "text-stone-400"
						}`}
					>
						<StepIcon state={state} />
						{label}
					</li>
				);
			})}
		</ul>
	);
}
