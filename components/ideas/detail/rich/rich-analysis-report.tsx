"use client";

import type {
	RichAnalysisReport as RichAnalysisReportData,
	RichAxisKey,
} from "@/lib/analysis/rich-types";
import {
	RICH_AXES,
	RICH_RADAR_LABELS,
	formatAnalysisVersion,
	richRadarValues,
} from "@/lib/analysis/rich-types";
import {
	PANEL,
	formatAnalyzedAt,
} from "@/components/ideas/detail/idea-detail-shared";
import { ScoreRing } from "@/components/ideas/score-ring";
import { RadarChart } from "@/components/ideas/detail/visual/radar-chart";
import {
	type FactorTone,
	TONE_BAR_CLASS,
	TONE_TEXT_CLASS,
	toneFromLevel,
} from "@/lib/analysis/visual-metrics";
import { inputQualityMeta } from "@/lib/analysis/input-quality";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar, ChevronDown, History, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const AXIS_META = Object.fromEntries(
	RICH_AXES.map((a) => [a.key, a]),
) as Record<RichAxisKey, (typeof RICH_AXES)[number]>;

const AXIS_ORDER: RichAxisKey[] = RICH_AXES.map((a) => a.key);

const EASE = [0.22, 1, 0.36, 1] as const;

/** Единая палитра по баллу: только красный / жёлтый / зелёный. */
const TONE_STYLE: Record<
	FactorTone,
	{ ring: string; text: string; glow: string }
> = {
	strong: {
		ring: "stroke-emerald-400",
		text: "text-emerald-400",
		glow: "bg-emerald-500/15",
	},
	ok: {
		ring: "stroke-amber-400",
		text: "text-amber-400",
		glow: "bg-amber-500/15",
	},
	poor: {
		ring: "stroke-rose-400",
		text: "text-rose-400",
		glow: "bg-rose-500/15",
	},
};

const container = {
	hidden: { opacity: 1 },
	show: {
		opacity: 1,
		transition: { staggerChildren: 0.08, delayChildren: 0.04 },
	},
};

const item = {
	hidden: { opacity: 0, y: 14 },
	show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

export function RichAnalysisReport({
	report,
}: {
	report: RichAnalysisReportData;
}) {
	return (
		<motion.div
			variants={container}
			initial="hidden"
			animate="show"
			className="space-y-3.5"
		>
			<VerdictHero report={report} />
			<AxesSection report={report} />
		</motion.div>
	);
}

/* ── 1. Шапка с оценкой и профилем ───────────────────────────────────── */

function VerdictHero({ report }: { report: RichAnalysisReportData }) {
	const tone = toneFromLevel(report.score);
	const c = TONE_STYLE[tone];

	return (
		<motion.section
			variants={item}
			className={`relative overflow-hidden ${PANEL} p-6 sm:px-8 sm:py-2`}
		>
			<div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-12">
				<div className="flex min-w-0 flex-1 flex-col">
					<div className="flex items-center gap-4">
						<ScoreRing
							score={report.score}
							size="lg"
							ringClassName={c.ring}
							textClassName={c.text}
						/>
						<div className="min-w-0">
							<p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
								<Sparkles className="size-3.5 text-amber-400/90" />
								Оценка идеи
							</p>
							<DetailLevel quality={report.inputQuality} />
						</div>
					</div>

					<p className="mt-6 text-pretty text-base font-medium leading-relaxed text-stone-200">
						{report.verdictLine}
					</p>

					<div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1.5">
						<span className="inline-flex items-center gap-1.5 text-xs text-stone-500">
							<History className="size-3.5 shrink-0" />
							{formatAnalysisVersion(report.version)}
						</span>
						<span className="inline-flex items-center gap-1.5 text-xs text-stone-500">
							<Calendar className="size-3.5 shrink-0" />
							{formatAnalyzedAt(report.analyzedAt)}
						</span>
					</div>
				</div>

				<div className="relative flex w-full shrink-0 items-center justify-center lg:w-72 lg:self-stretch">
					<div
						className={`pointer-events-none absolute size-44 rounded-full ${c.glow} blur-3xl`}
						aria-hidden
					/>
					<RadarChart
						values={richRadarValues(report)}
						labels={RICH_RADAR_LABELS}
						className="relative h-44 w-full max-w-60 sm:h-48 lg:h-full lg:max-h-64"
					/>
				</div>
			</div>
		</motion.section>
	);
}

/** Уровень детализации идеи (превалидация) — эквалайзер + тултип с пояснением. */
function DetailLevel({ quality }: { quality: number }) {
	const meta = inputQualityMeta(quality);
	const active =
		quality >= 60 ? 4 : quality >= 40 ? 3 : quality >= 20 ? 2 : 1;

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div className="group mt-1.5 flex w-fit cursor-help items-center gap-2 rounded-md border border-stone-800/60 bg-stone-900/30 px-2 py-1 transition-colors hover:bg-stone-800/50">
					<div className="flex h-3 items-end gap-0.5" aria-hidden>
						{[1, 2, 3, 4].map((i) => (
							<div
								key={i}
								className={`w-1 rounded-sm transition-colors ${
									i <= active
										? meta.bar
										: "bg-stone-800 group-hover:bg-stone-700"
								}`}
								style={{ height: `${(i / 4) * 100}%` }}
							/>
						))}
					</div>
					<span className="text-xs text-stone-400 transition-colors group-hover:text-stone-300">
						Детализация:{" "}
						<span className={meta.text}>{meta.short.toLowerCase()}</span>
					</span>
				</div>
			</TooltipTrigger>
			<TooltipContent>
				<p className="max-w-[220px] text-pretty">{meta.label}</p>
			</TooltipContent>
		</Tooltip>
	);
}

/* ── 2. Оси (интерактивный список) ───────────────────────────────────── */

function AxesSection({ report }: { report: RichAnalysisReportData }) {
	const [open, setOpen] = useState<RichAxisKey | null>(null);

	return (
		<motion.section
			variants={item}
			className={`${PANEL} space-y-1 p-2 sm:p-3`}
		>
			{AXIS_ORDER.map((key) => (
				<AxisRow
					key={key}
					axisKey={key}
					report={report}
					isOpen={open === key}
					onToggle={() => setOpen(open === key ? null : key)}
				/>
			))}
		</motion.section>
	);
}

function AxisRow({
	axisKey,
	report,
	isOpen,
	onToggle,
}: {
	axisKey: RichAxisKey;
	report: RichAnalysisReportData;
	isOpen: boolean;
	onToggle: () => void;
}) {
	const axis = report.axes[axisKey];
	const meta = AXIS_META[axisKey];
	const Icon = meta.icon;
	const tone = toneFromLevel(axis.score);

	return (
		<div className="rounded-xl">
			<button
				type="button"
				onClick={onToggle}
				className="flex w-full cursor-pointer items-center gap-3.5 rounded-xl px-3 py-3 text-left transition hover:bg-stone-800/40"
			>
				<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-stone-800/80">
					<Icon className="size-4 text-amber-400/90" />
				</div>
				<p className="min-w-0 flex-1 truncate text-sm font-semibold text-stone-100">
					{meta.label}
				</p>
				<div className="h-1 w-16 overflow-hidden rounded-full bg-stone-800 sm:w-24">
					<motion.div
						className={`h-full rounded-full ${TONE_BAR_CLASS[tone]}`}
						initial={{ width: 0 }}
						animate={{ width: `${axis.score}%` }}
						transition={{ duration: 0.6, ease: EASE }}
					/>
				</div>
				<span
					className={`w-7 text-right text-base font-bold tabular-nums ${TONE_TEXT_CLASS[tone]}`}
				>
					{axis.score}
				</span>
				<ChevronDown
					className={`size-4 shrink-0 text-stone-500 transition-transform duration-300 ${
						isOpen ? "rotate-180" : ""
					}`}
				/>
			</button>

			<AnimatePresence initial={false}>
				{isOpen ? (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3, ease: EASE }}
						className="overflow-hidden"
					>
						<div className="px-3 pb-3 pl-15 pt-2.5">
							{axis.audience ? (
								<p className="mb-2.5 text-xs leading-relaxed text-stone-400">
									<span className="text-stone-500">Аудитория: </span>
									{axis.audience.toLocaleLowerCase()}
								</p>
							) : null}

							<ul className="space-y-2">
								{axis.bullets.map((b, i) => (
									<li
										key={i}
										className="flex gap-2.5 text-sm leading-relaxed text-stone-300"
									>
										<span className="mt-2 size-1 shrink-0 rounded-full bg-amber-500/70" />
										<span>{b}</span>
									</li>
								))}
							</ul>
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}
