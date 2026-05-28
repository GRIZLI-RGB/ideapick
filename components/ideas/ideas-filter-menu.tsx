"use client";

import { useIdeasDemo } from "@/components/ideas/ideas-demo-provider";
import type { AnalysisFilter, SortOption } from "@/lib/ideas/types";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const FILTERS: { value: AnalysisFilter; label: string }[] = [
	{ value: "all", label: "Все" },
	{ value: "analyzed", label: "С анализом" },
	{ value: "pending", label: "Без анализа" },
];

const SORTS: { value: SortOption; label: string }[] = [
	{ value: "newest", label: "Сначала новые" },
	{ value: "oldest", label: "Сначала старые" },
	{ value: "score", label: "По оценке" },
	{ value: "name", label: "По названию" },
];

function isActiveFilter(filter: AnalysisFilter, sort: SortOption) {
	return filter !== "all" || sort !== "newest";
}

export function IdeasFilterMenu() {
	const { filter, sort, setFilter, setSort } = useIdeasDemo();
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	const activeFilter = FILTERS.find((f) => f.value === filter)!;
	const activeSort = SORTS.find((s) => s.value === sort)!;
	const hasCustom = isActiveFilter(filter, sort);

	useEffect(() => {
		if (!open) return;
		function onClick(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		}
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") setOpen(false);
		}
		document.addEventListener("mousedown", onClick);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", onClick);
			document.removeEventListener("keydown", onKey);
		};
	}, [open]);

	return (
		<div className="relative" ref={ref}>
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 ${
					hasCustom
						? "border-amber-500/30 bg-amber-500/10 text-amber-100 hover:border-amber-500/40 hover:bg-amber-500/15"
						: "border-stone-700 bg-stone-900 text-stone-200 hover:border-stone-600 hover:bg-stone-800"
				}`}
				aria-expanded={open}
				aria-haspopup="listbox"
			>
				<SlidersHorizontal className="size-4 shrink-0" />
				<span className="max-w-36 truncate sm:max-w-none">
					{hasCustom
						? `${activeFilter.label} · ${activeSort.label}`
						: "Фильтр"}
				</span>
				<ChevronDown
					className={`size-4 shrink-0 transition ${open ? "rotate-180" : ""}`}
				/>
			</button>

			<AnimatePresence>
				{open ? (
					<motion.div
						initial={{ opacity: 0, y: 6, scale: 0.98 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 4, scale: 0.98 }}
						transition={{ duration: 0.15 }}
						className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-stone-700/80 bg-stone-900 shadow-2xl shadow-black/50 ring-1 ring-white/5"
					>
						<div className="border-b border-stone-800/80 px-4 py-2.5">
							<p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
								Показать
							</p>
						</div>
						<ul role="listbox" aria-label="Фильтр идей">
							{FILTERS.map((f) => {
								const selected = filter === f.value;
								return (
									<li key={f.value}>
										<button
											type="button"
											role="option"
											aria-selected={selected}
											onClick={() => setFilter(f.value)}
											className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-stone-800/60"
										>
											<span
												className={
													selected
														? "font-medium text-stone-100"
														: "text-stone-400"
												}
											>
												{f.label}
											</span>
											{selected ? (
												<Check className="size-4 shrink-0 text-amber-400" />
											) : null}
										</button>
									</li>
								);
							})}
						</ul>

						<div className="border-t border-b border-stone-800/80 px-4 py-2.5">
							<p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
								Сортировка
							</p>
						</div>
						<ul role="listbox" aria-label="Сортировка идей">
							{SORTS.map((s) => {
								const selected = sort === s.value;
								return (
									<li key={s.value}>
										<button
											type="button"
											role="option"
											aria-selected={selected}
											onClick={() => setSort(s.value)}
											className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-stone-800/60"
										>
											<span
												className={
													selected
														? "font-medium text-stone-100"
														: "text-stone-400"
												}
											>
												{s.label}
											</span>
											{selected ? (
												<Check className="size-4 shrink-0 text-amber-400" />
											) : null}
										</button>
									</li>
								);
							})}
						</ul>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}
