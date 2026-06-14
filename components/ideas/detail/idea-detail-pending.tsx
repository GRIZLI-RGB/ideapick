"use client";

import { PRICES } from "@/lib/ideas/constants";
import type { Idea } from "@/lib/ideas/types";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

type IdeaDetailPendingProps = {
	idea: Idea;
	/** Демо: запуск анализа без списания — отдаёт готовность отрисовать отчёт. */
	onAnalyzed: () => void;
};

/** Шаги «генерации» — имитируют реальный пайплайн (превалидация → поиск →
 *  анализ → сборка), чтобы ожидание ощущалось как работа, а не пустой спиннер. */
const STEPS = ["Валидируем идею", "Изучаем рынок", "Формируем отчёт"];
const STEP_MS = 1000;

export function IdeaDetailPending({
	idea,
	onAnalyzed,
}: IdeaDetailPendingProps) {
	const price = PRICES.analysis;
	const [loading, setLoading] = useState(false);
	const [step, setStep] = useState(0);

	useEffect(() => {
		if (!loading) return;
		if (step >= STEPS.length - 1) {
			const done = window.setTimeout(onAnalyzed, STEP_MS);
			return () => window.clearTimeout(done);
		}
		const next = window.setTimeout(() => setStep((s) => s + 1), STEP_MS);
		return () => window.clearTimeout(next);
	}, [loading, step, onAnalyzed]);

	function handleAnalyze() {
		setStep(0);
		setLoading(true);
	}

	return (
		<div className="rounded-2xl border border-stone-800/60 bg-linear-to-b from-stone-900/60 to-stone-950/40 p-6 sm:p-8">
			<div className="mx-auto max-w-md text-center">
				<div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/20">
					<Sparkles className="size-7 text-amber-400" />
				</div>
				<h2 className="mt-4 text-lg font-semibold text-stone-100">
					{loading ? "Анализируем идею" : "Анализ ещё не запускался"}
				</h2>

				{loading ? (
					<ul className="mx-auto mt-5 flex max-w-sm flex-col items-center gap-2">
						{STEPS.map((label, i) => {
							const state =
								i < step
									? "done"
									: i === step
										? "active"
										: "idle";
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
											<motion.span
												className="size-1.5 rounded-full bg-emerald-400"
												initial={{ scale: 0 }}
												animate={{ scale: [1, 1.3, 1] }}
												transition={{
													duration: 1.8,
													repeat: Infinity,
													ease: "easeInOut",
												}}
											/>
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
				) : (
					<>
						<p className="mt-2 text-sm leading-relaxed text-stone-500">
							Система оценит «{idea.title}» и даст свою оценку.
						</p>
						<button
							type="button"
							onClick={handleAnalyze}
							className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 sm:w-auto"
						>
							Запустить анализ · {price} ₽
						</button>
					</>
				)}
			</div>
		</div>
	);
}
