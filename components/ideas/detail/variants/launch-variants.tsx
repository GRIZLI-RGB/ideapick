"use client";

import { ScoreRing } from "@/components/ideas/score-ring";
import { RadarChart } from "@/components/ideas/detail/visual/radar-chart";
import { PANEL } from "@/components/ideas/detail/idea-detail-shared";
import { RICH_AXES, RICH_RADAR_LABELS } from "@/lib/analysis/rich-types";
import { motion } from "framer-motion";
import {
	ArrowRight,
	Check,
	Loader2,
	Lock,
	Sparkles,
	Wallet,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────────
 * Тестовая лаборатория: варианты окна запуска анализа (до отчёта).
 * Компоненты самодостаточны (без провайдера), чтобы сравнивать их на /dev.
 * ────────────────────────────────────────────────────────────────────────── */

export const SAMPLE_TITLE = "Линтер промптов для VS Code";

const STEPS = ["Валидируем идею", "Изучаем рынок", "Формируем отчёт"];

type VariantProps = {
	title?: string;
	price: number;
	balance: number;
	running: boolean;
	step: number;
	onLaunch: () => void;
	onTopUp: () => void;
};

/** Список «что входит» — берётся из реальных осей отчёта, чтобы обещание
 *  совпадало с тем, что человек увидит после оплаты. */
const SAMPLE_RADAR = [0.72, 0.22, 0.45, 0.55, 0.78, 0.28];

function RunningSteps() {
	return (
		<ul className="mx-auto mt-5 flex max-w-sm flex-col items-center gap-2">
			{STEPS.map((label) => (
				<li
					key={label}
					className="flex items-center justify-center gap-2.5 text-center text-sm text-stone-300"
				>
					<Loader2 className="size-4 shrink-0 animate-spin text-amber-400" />
					{label}
				</li>
			))}
		</ul>
	);
}

function Steps({ step }: { step: number }) {
	return (
		<ul className="mx-auto mt-5 flex max-w-sm flex-col items-center gap-2">
			{STEPS.map((label, i) => {
				const state = i < step ? "done" : i === step ? "active" : "idle";
				return (
					<li
						key={label}
						className={`flex items-center justify-center gap-2.5 text-center text-sm transition ${
							state === "idle"
								? "text-stone-600"
								: state === "active"
									? "text-stone-200"
									: "text-stone-400"
						}`}
					>
						{state === "done" ? (
							<span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-500/30">
								<Check className="size-2.5 text-emerald-400" />
							</span>
						) : state === "active" ? (
							<Loader2 className="size-4 shrink-0 animate-spin text-amber-400" />
						) : (
							<span className="size-4 shrink-0 rounded-full border border-stone-700" />
						)}
						{label}
					</li>
				);
			})}
		</ul>
	);
}

/* ── Вариант 1. Текущий (baseline) ───────────────────────────────────── */

export function LaunchVariantCurrent({
	title = SAMPLE_TITLE,
	price,
	balance,
	running,
	step,
	onLaunch,
	onTopUp,
}: VariantProps) {
	const insufficient = balance < price;
	return (
		<div className="rounded-2xl border border-stone-800/60 bg-linear-to-b from-stone-900/60 to-stone-950/40 p-6 sm:p-8">
			<div className="mx-auto max-w-md text-center">
				<div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/20">
					<Sparkles className="size-7 text-amber-400" />
				</div>
				<h2 className="mt-4 text-lg font-semibold text-stone-100">
					{running ? "Анализируем идею" : "Анализ ещё не запускался"}
				</h2>
				{running ? (
					<Steps step={step} />
				) : (
					<>
						<p className="mt-2 text-sm leading-relaxed text-stone-500">
							Система оценит «{title}» и даст свою оценку.
						</p>
						<button
							type="button"
							onClick={insufficient ? onTopUp : onLaunch}
							className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-400 sm:w-auto"
						>
							{insufficient ? (
								<>
									<Wallet className="size-4" /> Пополнить баланс
								</>
							) : (
								<>Запустить анализ · {price} ₽</>
							)}
						</button>
					</>
				)}
			</div>
		</div>
	);
}

/* ── Вариант 2. Превью ценности ──────────────────────────────────────── */

export function LaunchVariantValue({
	title = SAMPLE_TITLE,
	price,
	balance,
	running,
	step,
	onLaunch,
	onTopUp,
}: VariantProps) {
	const insufficient = balance < price;
	return (
		<div className={`${PANEL} overflow-hidden`}>
			<div className="border-b border-stone-800/60 bg-stone-900/30 px-6 py-5 sm:px-8">
				<div className="flex items-center gap-3.5">
					<div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-500/20">
						<Sparkles className="size-5 text-amber-400" />
					</div>
					<div className="min-w-0">
						<h2 className="text-base font-semibold text-stone-100">
							AI-анализ идеи
						</h2>
						<p className="truncate text-sm text-stone-500">«{title}»</p>
					</div>
				</div>
			</div>

			<div className="p-6 sm:p-8">
				{running ? (
					<div className="text-center">
						<Steps step={step} />
					</div>
				) : (
					<>
						<p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
							Что вы получите
						</p>
						<ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
							{RICH_AXES.map((axis) => {
								const Icon = axis.icon;
								return (
									<li
										key={axis.key}
										className="flex items-center gap-2.5 text-sm text-stone-300"
									>
										<Icon className="size-4 shrink-0 text-amber-400/80" />
										{axis.label}
									</li>
								);
							})}
						</ul>

						<div className="mt-5 flex items-center gap-2 rounded-xl border border-stone-800/60 bg-stone-900/40 px-3.5 py-2.5 text-xs text-stone-400">
							<Check className="size-3.5 shrink-0 text-emerald-400/80" />
							Итоговый балл, вердикт и ключевая гипотеза с планом проверки
						</div>

						<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<button
								type="button"
								onClick={insufficient ? onTopUp : onLaunch}
								className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-400"
							>
								{insufficient ? (
									<>
										<Wallet className="size-4" /> Пополнить баланс
									</>
								) : (
									<>
										Запустить анализ · {price} ₽
										<ArrowRight className="size-4" />
									</>
								)}
							</button>
							<p
								className={`text-xs ${insufficient ? "text-amber-300/80" : "text-stone-500"}`}
							>
								{insufficient
									? `Не хватает ${price - balance} ₽ · на балансе ${balance} ₽`
									: `Спишется ${price} ₽ · на балансе ${balance} ₽`}
							</p>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

/* ── Вариант 3. Размытый тизер отчёта ────────────────────────────────── */

export function LaunchVariantTeaser({
	title = SAMPLE_TITLE,
	price,
	balance,
	running,
	step,
	onLaunch,
	onTopUp,
}: VariantProps) {
	const insufficient = balance < price;

	if (running) {
		return (
			<div className={`${PANEL} p-6 text-center sm:p-8`}>
				<h2 className="text-lg font-semibold text-stone-100">
					Анализируем идею
				</h2>
				<Steps step={step} />
			</div>
		);
	}

	return (
		<div className={`relative overflow-hidden ${PANEL}`}>
			{/* Фоновый «отчёт» под размытием — намёк на результат */}
			<div
				aria-hidden
				className="pointer-events-none select-none blur-[6px]"
			>
				<div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:px-8">
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
						</div>
					</div>
					<RadarChart
						values={SAMPLE_RADAR}
						labels={RICH_RADAR_LABELS}
						className="h-36 w-full max-w-56 sm:h-40"
					/>
				</div>
				<div className="space-y-2 px-6 pb-6 sm:px-8">
					<div className="h-3 w-full rounded bg-stone-800" />
					<div className="h-3 w-4/5 rounded bg-stone-800" />
				</div>
			</div>

			{/* Затемнение + центральный CTA */}
			<div className="absolute inset-0 flex items-center justify-center bg-stone-950/55 backdrop-blur-[2px]">
				<div className="mx-4 max-w-sm rounded-2xl border border-stone-700/60 bg-stone-900/80 p-6 text-center shadow-2xl shadow-black/40">
					<div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-500/20">
						<Lock className="size-5 text-amber-400" />
					</div>
					<h2 className="mt-3.5 text-base font-semibold text-stone-100">
						Отчёт по «{title}» готов к запуску
					</h2>
					<p className="mt-1.5 text-sm text-stone-500">
						Балл, профиль по 6 факторам и план проверки.
					</p>
					<button
						type="button"
						onClick={insufficient ? onTopUp : onLaunch}
						className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-400"
					>
						{insufficient ? (
							<>
								<Wallet className="size-4" /> Пополнить баланс
							</>
						) : (
							<>Открыть анализ · {price} ₽</>
						)}
					</button>
					<p
						className={`mt-3 text-xs ${insufficient ? "text-amber-300/80" : "text-stone-500"}`}
					>
						{insufficient
							? `Не хватает ${price - balance} ₽ · на балансе ${balance} ₽`
							: `на балансе ${balance} ₽`}
					</p>
				</div>
			</div>
		</div>
	);
}

/* ── Вариант 4. Компактная панель ────────────────────────────────────── */

export function LaunchVariantCompact({
	title = SAMPLE_TITLE,
	price,
	balance,
	running,
	step,
	onLaunch,
	onTopUp,
}: VariantProps) {
	const insufficient = balance < price;

	if (running) {
		return (
			<div className={`${PANEL} p-5 text-center sm:p-6`}>
				<RunningSteps />
			</div>
		);
	}

	return (
		<div className={`${PANEL} p-5 sm:p-6`}>
			<div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-start gap-3.5">
					<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-500/20">
						<Sparkles className="size-5 text-amber-400" />
					</div>
					<div className="min-w-0">
						<h2 className="text-sm font-semibold text-stone-100">
							Запустить AI-анализ
						</h2>
						<p className="mt-0.5 text-sm text-stone-500">
							Оценка спроса, конкуренции и рисков по «{title}».
						</p>
						<div className="mt-2.5 flex flex-wrap gap-1.5">
							{RICH_AXES.slice(0, 4).map((axis) => (
								<span
									key={axis.key}
									className="rounded-lg border border-stone-700/60 bg-stone-800/40 px-2 py-0.5 text-[11px] text-stone-400"
								>
									{axis.short}
								</span>
							))}
							<span className="rounded-lg border border-stone-700/60 bg-stone-800/40 px-2 py-0.5 text-[11px] text-stone-400">
								+2
							</span>
						</div>
					</div>
				</div>

				<div className="flex shrink-0 flex-col items-stretch gap-1.5 sm:items-end">
					<button
						type="button"
						onClick={insufficient ? onTopUp : onLaunch}
						className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-400"
					>
						{insufficient ? (
							<>
								<Wallet className="size-4" /> Пополнить
							</>
						) : (
							<>Запустить · {price} ₽</>
						)}
					</button>
					<p
						className={`text-center text-[11px] sm:text-right ${insufficient ? "text-amber-300/80" : "text-stone-500"}`}
					>
						на балансе {balance} ₽
					</p>
				</div>
			</div>
		</div>
	);
}

/** Лёгкая обёртка-карточка для презентации варианта на тестовой странице. */
export function VariantFrame({
	index,
	name,
	note,
	children,
}: {
	index: number;
	name: string;
	note: string;
	children: React.ReactNode;
}) {
	return (
		<motion.section
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.06, duration: 0.35 }}
			className="space-y-3"
		>
			<div className="flex items-baseline gap-2.5">
				<span className="flex size-6 items-center justify-center rounded-md bg-amber-500/15 text-xs font-bold text-amber-300">
					{index + 1}
				</span>
				<h3 className="text-sm font-semibold text-stone-100">{name}</h3>
				<span className="text-xs text-stone-500">— {note}</span>
			</div>
			{children}
		</motion.section>
	);
}
