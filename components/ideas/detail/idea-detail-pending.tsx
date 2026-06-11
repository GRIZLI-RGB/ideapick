"use client";

import { useIdeasDemo } from "@/components/ideas/ideas-demo-provider";
import { PRICES } from "@/lib/ideas/constants";
import type { Idea } from "@/lib/ideas/types";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

type IdeaDetailPendingProps = {
	idea: Idea;
};

export function IdeaDetailPending({ idea }: IdeaDetailPendingProps) {
	const { balance, openWallet } = useIdeasDemo();
	const [loading, setLoading] = useState(false);
	const price = PRICES.analysis;
	const canAfford = balance >= price;

	async function handleAnalyze() {
		if (!canAfford) {
			openWallet();
			return;
		}
		setLoading(true);
		await new Promise((r) => setTimeout(r, 1800));
		setLoading(false);
		// Demo: full run wired later in provider
	}

	return (
		<div className="rounded-2xl border border-stone-800/60 bg-gradient-to-b from-stone-900/60 to-stone-950/40 p-6 sm:p-8">
			<div className="mx-auto max-w-md text-center">
				<div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/20">
					<Sparkles className="size-7 text-amber-400" />
				</div>
				<h2 className="mt-4 text-lg font-semibold text-stone-100">
					Анализ ещё не запускался
				</h2>
				<p className="mt-2 text-sm leading-relaxed text-stone-500">
					AI оценит «{idea.title}» по спросу, конкуренции, монетизации
					и рискам.
				</p>
				<button
					type="button"
					disabled={loading}
					onClick={handleAnalyze}
					className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-400 disabled:cursor-wait disabled:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 sm:w-auto"
				>
					{loading ? (
						<>
							<Loader2 className="size-4 animate-spin" />
							Анализируем…
						</>
					) : (
						<>Запустить анализ · {price} ₽</>
					)}
				</button>
				{!canAfford && (
					<p className="mt-3 text-xs text-amber-400/90">
						Недостаточно средств ({balance} ₽) — откроется
						пополнение
					</p>
				)}
			</div>
		</div>
	);
}
