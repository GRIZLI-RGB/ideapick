"use client";

import { PANEL } from "@/components/ideas/detail/idea-detail-shared";
import { RadarChart } from "@/components/ideas/detail/visual/radar-chart";
import { ScoreRing } from "@/components/ideas/score-ring";
import { RICH_AXES, RICH_RADAR_LABELS } from "@/lib/analysis/rich-types";
import { PRICES } from "@/lib/ideas/constants";
import { VariantFrame } from "@/components/ideas/detail/variants/launch-variants";
import { AnimatePresence, motion } from "framer-motion";
import {
	Check,
	Loader2,
	Lock,
	Search,
	Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/* ── Общие константы (как в prod) ─────────────────────────────────────── */

export const ANALYSIS_STEPS = [
	"Валидируем идею",
	"Изучаем рынок",
	"Формируем отчёт",
] as const;

export const ANALYSIS_STEP_MS = 1000;
export const SAMPLE_IDEA_TITLE = "Линтер промптов для VS Code";
const TEASER_RADAR = [0.72, 0.22, 0.45, 0.55, 0.78, 0.28];
const EASE = [0.22, 1, 0.36, 1] as const;

type RunningProps = {
	step: number;
	title: string;
};

type DemoProps = {
	title?: string;
	price?: number;
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

/* ── Idle: идентично prod (тизер + кнопка, без платежа) ──────────────── */

function TeaserIdleCard({
	title,
	price,
	onLaunch,
}: {
	title: string;
	price: number;
	onLaunch: () => void;
}) {
	return (
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
				onClick={onLaunch}
				className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
			>
				Запустить анализ · {price} ₽
			</button>
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

function TeaserIdle({
	title,
	price,
	onLaunch,
}: {
	title: string;
	price: number;
	onLaunch: () => void;
}) {
	return (
		<TeaserShell>
			<TeaserIdleCard title={title} price={price} onLaunch={onLaunch} />
		</TeaserShell>
	);
}

/* ── Вариант 1. Текущий — пустая панель, шаги по центру ─────────────── */

export function RunningCurrent({ step }: RunningProps) {
	return (
		<div
			className={`${PANEL} flex min-h-88 flex-col items-center justify-center p-6 text-center sm:min-h-76 sm:p-8`}
		>
			<h2 className="text-lg font-semibold text-stone-100">
				Анализируем идею
			</h2>
			<StepList step={step} layout="center" />
		</div>
	);
}

/* ── Вариант 2. Оверлей на тизере — фон остаётся ───────────────────── */

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

/* ── Вариант 3. Одна строка + прогресс (без списка) ─────────────────── */

export function RunningProgressLine({ step, title }: RunningProps) {
	const progress = ((step + 1) / ANALYSIS_STEPS.length) * 100;
	const label = ANALYSIS_STEPS[step];

	return (
		<TeaserShell blur={3} dim={0.6}>
			<div className="w-full max-w-md rounded-2xl border border-stone-700/60 bg-stone-900/90 p-6 text-center shadow-xl shadow-black/30">
				<p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
					AI-анализ
				</p>
				<div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-800">
					<motion.div
						className="h-full rounded-full bg-linear-to-r from-amber-500 to-amber-300"
						animate={{ width: `${progress}%` }}
						transition={{ duration: 0.5, ease: EASE }}
					/>
				</div>
				<div className="relative mt-5 h-6 overflow-hidden">
					<AnimatePresence mode="wait">
						<motion.p
							key={label}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.25 }}
							className="absolute inset-x-0 text-sm font-medium text-stone-200"
						>
							{label}…
						</motion.p>
					</AnimatePresence>
				</div>
				<p className="mt-2 truncate text-xs text-stone-500">«{title}»</p>
				<p className="mt-4 text-xs tabular-nums text-stone-600">
					Шаг {step + 1} из {ANALYSIS_STEPS.length}
				</p>
			</div>
		</TeaserShell>
	);
}

/* ── Вариант 4. Пайплайн — строки как в отчёте (все шаги видны) ─────── */

export function RunningPipeline({ step }: RunningProps) {
	return (
		<div className={`${PANEL} p-2 sm:p-3`}>
			<div className="border-b border-stone-800/60 px-3 py-3 sm:px-4">
				<div className="flex items-center gap-3">
					<div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 ring-1 ring-amber-500/20">
						<Sparkles className="size-4 text-amber-400" />
					</div>
					<div>
						<p className="text-sm font-semibold text-stone-100">
							Собираем отчёт
						</p>
						<p className="text-xs text-stone-500">
							{step + 1} / {ANALYSIS_STEPS.length} этапов
						</p>
					</div>
				</div>
			</div>
			<ul className="space-y-1 p-1">
				{ANALYSIS_STEPS.map((label, i) => {
					const state =
						i < step ? "done" : i === step ? "active" : "idle";
					return (
						<li
							key={label}
							className={`flex items-center gap-3 rounded-xl px-3 py-3 transition ${
								state === "active"
									? "bg-stone-800/50"
									: state === "done"
										? "opacity-80"
										: "opacity-40"
							}`}
						>
							<StepIcon state={state} />
							<span
								className={`text-sm ${
									state === "active"
										? "font-medium text-stone-100"
										: "text-stone-400"
								}`}
							>
								{label}
							</span>
							{state === "done" ? (
								<span className="ml-auto text-[11px] text-emerald-400/90">
									Готово
								</span>
							) : null}
						</li>
					);
				})}
			</ul>
		</div>
	);
}

/* ── Вариант 5. Скелет отчёта — фон проявляется, контент «наполняется» ─ */

export function RunningSkeleton({ step, title }: RunningProps) {
	const blur = Math.max(0, 6 - step * 2);
	const dim = Math.max(0.25, 0.55 - step * 0.12);
	const score = 40 + step * 11;
	const radarFill = TEASER_RADAR.map((v, i) =>
		Math.min(v, v * ((step + 1) / ANALYSIS_STEPS.length) + i * 0.02),
	);

	return (
		<div
			className={`relative overflow-hidden ${PANEL} min-h-88 sm:min-h-76`}
		>
			<TeaserBackground blur={blur} />
			<div
				aria-hidden
				className="absolute inset-0 z-1 backdrop-blur-[1px] transition-colors duration-500"
				style={{ backgroundColor: `rgb(12 10 9 / ${dim})` }}
			/>
			<div className="relative z-10 flex min-h-88 flex-col justify-between p-4 sm:min-h-76 sm:p-6">
				<div className="flex items-center justify-between gap-3 rounded-xl border border-stone-800/60 bg-stone-900/70 px-4 py-3 backdrop-blur-sm">
					<div className="flex min-w-0 items-center gap-3">
						<Loader2 className="size-4 shrink-0 animate-spin text-amber-400" />
						<div className="min-w-0 text-left">
							<p className="truncate text-sm font-medium text-stone-200">
								{ANALYSIS_STEPS[step]}…
							</p>
							<p className="truncate text-xs text-stone-500">
								«{title}»
							</p>
						</div>
					</div>
					<span className="shrink-0 text-xs tabular-nums text-stone-500">
						{step + 1}/{ANALYSIS_STEPS.length}
					</span>
				</div>

				<div className="mx-auto w-full max-w-lg rounded-2xl border border-stone-800/50 bg-stone-900/60 p-4 backdrop-blur-sm sm:p-5">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
						<div className="flex items-center gap-3">
							<ScoreRing
								score={score}
								size="lg"
								ringClassName="stroke-amber-400"
								textClassName="text-amber-400"
							/>
							<div className="space-y-1.5">
								<div
									className="h-2.5 rounded bg-stone-700/80 transition-all duration-500"
									style={{ width: `${55 + step * 15}%` }}
								/>
								<div
									className="h-2.5 rounded bg-stone-800 transition-all duration-500"
									style={{ width: `${35 + step * 10}%` }}
								/>
							</div>
						</div>
						<div className="h-32 flex-1 sm:h-36">
							<RadarChart
								values={radarFill}
								labels={RICH_RADAR_LABELS}
								className="h-full w-full opacity-90"
							/>
						</div>
					</div>
					<div className="mt-4 space-y-2">
						{RICH_AXES.slice(0, 3 + step).map((axis) => (
							<div
								key={axis.key}
								className="flex items-center gap-2 rounded-lg bg-stone-800/40 px-2.5 py-2"
							>
								<axis.icon className="size-3.5 text-amber-400/80" />
								<span className="text-xs text-stone-400">
									{axis.label}
								</span>
								<div className="ml-auto h-1 w-16 overflow-hidden rounded-full bg-stone-700">
									<motion.div
										className="h-full rounded-full bg-amber-400/80"
										initial={{ width: 0 }}
										animate={{ width: "70%" }}
										transition={{ duration: 0.6, ease: EASE }}
									/>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

/* ── Вариант 6. Лог — строки появляются снизу ───────────────────────── */

export function RunningLog({ step }: RunningProps) {
	const visible = ANALYSIS_STEPS.slice(0, step + 1);

	return (
		<TeaserShell blur={5} dim={0.7}>
			<div className="w-full max-w-md overflow-hidden rounded-2xl border border-stone-700/60 bg-stone-950/90 shadow-xl shadow-black/40">
				<div className="flex items-center gap-2 border-b border-stone-800/80 px-4 py-2.5">
					<Search className="size-3.5 text-stone-500" />
					<span className="text-xs font-medium text-stone-400">
						Пайплайн анализа
					</span>
					<Loader2 className="ml-auto size-3.5 animate-spin text-amber-400" />
				</div>
				<ul className="space-y-0 p-3 font-mono text-[13px] leading-relaxed">
					<AnimatePresence initial={false}>
						{visible.map((line, i) => {
							const done = i < step;
							return (
								<motion.li
									key={line}
									initial={{ opacity: 0, x: -8 }}
									animate={{ opacity: 1, x: 0 }}
									className="flex gap-2 py-1.5"
								>
									<span className="shrink-0 text-stone-600">
										{String(i + 1).padStart(2, "0")}
									</span>
									{done ? (
										<Check className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
									) : (
										<Loader2 className="mt-0.5 size-3.5 shrink-0 animate-spin text-amber-400" />
									)}
									<span
										className={
											done
												? "text-stone-500"
												: "text-stone-200"
										}
									>
										{line}
										{done ? "" : "…"}
									</span>
								</motion.li>
							);
						})}
					</AnimatePresence>
				</ul>
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

/* ── Демо-обёртка: idle → running → сброс (без платежа) ────────────── */

type RunningComponent = React.ComponentType<RunningProps>;

function AnalysisProgressDemo({
	RunningView,
	title = SAMPLE_IDEA_TITLE,
	price = PRICES.analysis,
}: DemoProps & { RunningView: RunningComponent }) {
	const [running, setRunning] = useState(false);
	const [step, setStep] = useState(0);
	const timer = useRef<number | undefined>(undefined);

	const reset = useCallback(() => {
		window.clearTimeout(timer.current);
		setRunning(false);
		setStep(0);
	}, []);

	useEffect(() => () => window.clearTimeout(timer.current), []);

	useEffect(() => {
		if (!running) return;
		if (step >= ANALYSIS_STEPS.length - 1) {
			timer.current = window.setTimeout(reset, ANALYSIS_STEP_MS + 800);
			return;
		}
		timer.current = window.setTimeout(
			() => setStep((s) => s + 1),
			ANALYSIS_STEP_MS,
		);
		return () => window.clearTimeout(timer.current);
	}, [running, step, reset]);

	if (!running) {
		return (
			<TeaserIdle
				title={title}
				price={price}
				onLaunch={() => {
					setStep(0);
					setRunning(true);
				}}
			/>
		);
	}

	return <RunningView step={step} title={title} />;
}

const PROGRESS_VARIANTS = [
	{
		id: "current",
		name: "Текущий",
		note: "пустая панель, шаги по центру — как сейчас",
		RunningView: RunningCurrent,
	},
	{
		id: "overlay",
		name: "Оверлей на тизере",
		note: "фон отчёта остаётся, прогресс в карточке",
		RunningView: RunningOverlay,
	},
	{
		id: "progress-line",
		name: "Одна строка",
		note: "полоска + смена текста без списка",
		RunningView: RunningProgressLine,
	},
	{
		id: "pipeline",
		name: "Пайплайн",
		note: "все шаги видны, как строки отчёта",
		RunningView: RunningPipeline,
	},
	{
		id: "skeleton",
		name: "Скелет отчёта",
		note: "фон проявляется, отчёт наполняется",
		RunningView: RunningSkeleton,
	},
	{
		id: "log",
		name: "Лог",
		note: "строки пайплайна появляются снизу",
		RunningView: RunningLog,
	},
] as const;

export function AnalysisProgressLab() {
	return (
		<main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
			<header className="mb-8">
				<p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400/80">
					Песочница UI
				</p>
				<h1 className="mt-1.5 text-2xl font-bold tracking-tight text-stone-50">
					Анимация анализа
				</h1>
				<p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-400">
					Кнопка запуска — как в prod, без списания. Нажмите «Запустить
					анализ», чтобы сравнить, как ощущается ожидание между
					этапами.
				</p>
			</header>

			<div className="space-y-12">
				{PROGRESS_VARIANTS.map(({ id, name, note, RunningView }, index) => (
					<VariantFrame key={id} index={index} name={name} note={note}>
						<AnalysisProgressDemo RunningView={RunningView} />
					</VariantFrame>
				))}
			</div>

			<p className="mt-12 text-center text-xs text-stone-600">
				Тестовая страница · /dev/analysis-progress
			</p>
		</main>
	);
}
