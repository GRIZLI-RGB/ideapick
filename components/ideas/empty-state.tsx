"use client";

import { useIdeasDemo } from "@/components/ideas/ideas-demo-provider";
import { PRICES } from "@/lib/ideas/constants";
import { motion } from "framer-motion";
import { Lightbulb, Shuffle, Sparkles } from "lucide-react";

export function EmptyState() {
	const { openDialog } = useIdeasDemo();

	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			className="mx-auto max-w-lg rounded-2xl border border-dashed border-stone-700/80 bg-stone-900/30 px-6 py-12 text-center sm:py-16"
		>
			<div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-stone-800/80 text-amber-400">
				<Lightbulb className="size-7" />
			</div>
			<h2 className="text-xl font-semibold text-stone-100">Пока нет идей</h2>
			<p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-stone-500">
				Добавьте свою, возьмите готовую из каталога или пройдите короткий
				анамнез — AI предложит идею под вас.
			</p>
			<div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
				<button
					type="button"
					onClick={() => openDialog("create")}
					className="cursor-pointer rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-400"
				>
					Своя идея · 0 ₽
				</button>
				<button
					type="button"
					onClick={() => openDialog("random")}
					className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-stone-700 bg-stone-900 px-5 py-2.5 text-sm font-medium text-stone-200 transition hover:border-stone-600 hover:bg-stone-800"
				>
					<Shuffle className="size-4" />
					Из каталога · 0 ₽
				</button>
				<button
					type="button"
					onClick={() => openDialog("anamnesis")}
					className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-stone-700 bg-stone-900 px-5 py-2.5 text-sm font-medium text-stone-200 transition hover:border-stone-600 hover:bg-stone-800"
				>
					<Sparkles className="size-4" />
					По анамнезу · {PRICES.anamnesis} ₽
				</button>
			</div>
		</motion.div>
	);
}
