"use client";

import {
	LaunchVariantCompact,
	LaunchVariantCurrent,
	LaunchVariantTeaser,
	LaunchVariantValue,
	VariantFrame,
} from "@/components/ideas/detail/variants/launch-variants";
import { PRICES } from "@/lib/ideas/constants";
import { useCallback, useEffect, useRef, useState } from "react";

const PRICE = PRICES.analysis;
const STEP_COUNT = 3;
const STEP_MS = 900;

const VARIANTS = [
	{
		id: "current",
		name: "Текущий",
		note: "как сейчас в проде",
		Component: LaunchVariantCurrent,
	},
	{
		id: "value",
		name: "Превью ценности",
		note: "показывает, что входит в анализ за 99 ₽",
		Component: LaunchVariantValue,
	},
	{
		id: "teaser",
		name: "Размытый тизер",
		note: "намёк на готовый отчёт под блюром",
		Component: LaunchVariantTeaser,
	},
	{
		id: "compact",
		name: "Компактная панель",
		note: "плотный блок без пустоты",
		Component: LaunchVariantCompact,
	},
] as const;

export default function AnalysisLaunchLabPage() {
	// Демо-баланс: переключатель достатка средств для предпросмотра состояний.
	const [balance, setBalance] = useState(250);
	const [runId, setRunId] = useState<string | null>(null);
	const [step, setStep] = useState(0);
	const timer = useRef<number | undefined>(undefined);

	const reset = useCallback(() => {
		window.clearTimeout(timer.current);
		setRunId(null);
		setStep(0);
	}, []);

	useEffect(() => () => window.clearTimeout(timer.current), []);

	const launch = useCallback((id: string) => {
		window.clearTimeout(timer.current);
		setRunId(id);
		setStep(0);
	}, []);

	useEffect(() => {
		if (!runId) return;
		if (step >= STEP_COUNT - 1) {
			// «Готово» — короткая пауза и сброс к исходному состоянию.
			timer.current = window.setTimeout(() => {
				setRunId(null);
				setStep(0);
			}, STEP_MS + 600);
			return;
		}
		timer.current = window.setTimeout(() => setStep((s) => s + 1), STEP_MS);
		return () => window.clearTimeout(timer.current);
	}, [runId, step]);

	return (
		<main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
			<header className="mb-8">
				<p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400/80">
					Песочница UI
				</p>
				<h1 className="mt-1.5 text-2xl font-bold tracking-tight text-stone-50">
					Окно запуска анализа
				</h1>
				<p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-400">
					Варианты состояния «идея ещё не проанализирована». Нажмите кнопку
					в любом варианте, чтобы прожить запуск и анимацию «генерации».
				</p>

				<div className="mt-5 inline-flex items-center gap-1 rounded-xl border border-stone-800/60 bg-stone-900/40 p-1">
					<button
						type="button"
						onClick={() => {
							setBalance(250);
							reset();
						}}
						className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition ${
							balance >= PRICE
								? "bg-amber-500 text-stone-950"
								: "text-stone-400 hover:text-stone-200"
						}`}
					>
						Достаточно средств (250 ₽)
					</button>
					<button
						type="button"
						onClick={() => {
							setBalance(40);
							reset();
						}}
						className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition ${
							balance < PRICE
								? "bg-amber-500 text-stone-950"
								: "text-stone-400 hover:text-stone-200"
						}`}
					>
						Недостаточно (40 ₽)
					</button>
				</div>
			</header>

			<div className="space-y-10">
				{VARIANTS.map(({ id, name, note, Component }, index) => (
					<VariantFrame key={id} index={index} name={name} note={note}>
						<Component
							price={PRICE}
							balance={balance}
							running={runId === id}
							step={runId === id ? step : 0}
							onLaunch={() => launch(id)}
							onTopUp={() => setBalance(250)}
						/>
					</VariantFrame>
				))}
			</div>

			<p className="mt-12 text-center text-xs text-stone-600">
				Тестовая страница · /dev/analysis-launch
			</p>
		</main>
	);
}
