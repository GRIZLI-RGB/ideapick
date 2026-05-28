"use client";

import { useIdeasDemo } from "@/components/ideas/ideas-demo-provider";

const EMPTY_HINT =
	"Добавьте первую идею — своими словами, из каталога или по анамнезу";

export function IdeasPageTitle() {
	const { stats } = useIdeasDemo();

	if (stats.total === 0) {
		return (
			<div className="min-w-0">
				<h1 className="text-2xl font-bold tracking-tight text-stone-50 sm:text-3xl">
					Идеи
				</h1>
				<p className="mt-1 text-sm text-stone-500">{EMPTY_HINT}</p>
			</div>
		);
	}

	return (
		<h1 className="flex items-baseline gap-2 text-2xl font-bold tracking-tight text-stone-50 sm:text-3xl">
			Идеи
			<span className="text-lg font-semibold tabular-nums text-stone-500 sm:text-xl">
				{stats.total}
			</span>
		</h1>
	);
}
