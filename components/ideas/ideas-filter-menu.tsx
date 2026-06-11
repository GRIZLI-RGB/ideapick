"use client";

import { useIdeasDemo } from "@/components/ideas/ideas-demo-provider";
import type { AnalysisFilter, SortOption } from "@/lib/ideas/types";
import { AnimatePresence, motion } from "framer-motion";
import {
	Archive,
	ArrowDownAZ,
	CalendarArrowDown,
	CalendarArrowUp,
	ChevronDown,
	CircleDashed,
	Gauge,
	Lightbulb,
	RotateCcw,
	SlidersHorizontal,
	type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const FILTERS: { value: AnalysisFilter; label: string; icon: LucideIcon }[] = [
	{ value: "all", label: "Все", icon: Lightbulb },
	{ value: "pending", label: "Без анализа", icon: CircleDashed },
	{ value: "archived", label: "Архив", icon: Archive },
];

const SORTS: { value: SortOption; label: string; icon: LucideIcon }[] = [
	{ value: "newest", label: "Новые", icon: CalendarArrowDown },
	{ value: "oldest", label: "Старые", icon: CalendarArrowUp },
	{ value: "score", label: "По оценке", icon: Gauge },
	{ value: "name", label: "По названию", icon: ArrowDownAZ },
];

export function IdeasFilterMenu() {
	const { filter, sort, setFilter, setSort } = useIdeasDemo();
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	const hasCustom = filter !== "all" || sort !== "newest";

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
				aria-haspopup="dialog"
			>
				<SlidersHorizontal className="size-4 shrink-0" />
				Фильтры
				{hasCustom ? (
					<span
						className="size-1.5 shrink-0 rounded-full bg-amber-400"
						aria-label="Применены фильтры"
					/>
				) : null}
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
						className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] space-y-4 rounded-xl border border-stone-700/80 bg-stone-900 p-4 shadow-2xl shadow-black/50 ring-1 ring-white/5"
						role="dialog"
						aria-label="Фильтры и сортировка идей"
					>
						<div>
							<p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
								Показать
							</p>
							<div
								className="mt-2 flex gap-1.5"
								role="radiogroup"
								aria-label="Фильтр идей"
							>
								{FILTERS.map((f) => {
									const selected = filter === f.value;
									const Icon = f.icon;
									return (
										<button
											key={f.value}
											type="button"
											role="radio"
											aria-checked={selected}
											onClick={() => setFilter(f.value)}
											className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border px-2 py-2 text-xs font-medium transition ${
												selected
													? "border-amber-500/40 bg-amber-500/10 text-amber-200"
													: "border-stone-800 bg-stone-950/60 text-stone-400 hover:border-stone-600 hover:text-stone-200"
											}`}
										>
											<Icon
												className={`size-3.5 shrink-0 ${
													selected
														? "text-amber-400"
														: "text-stone-500"
												}`}
											/>
											{f.label}
										</button>
									);
								})}
							</div>
						</div>

						<div>
							<p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
								Сортировка
							</p>
							<div
								className="mt-2 grid grid-cols-2 gap-1.5"
								role="radiogroup"
								aria-label="Сортировка идей"
							>
								{SORTS.map((s) => {
									const selected = sort === s.value;
									const Icon = s.icon;
									return (
										<button
											key={s.value}
											type="button"
											role="radio"
											aria-checked={selected}
											onClick={() => setSort(s.value)}
											className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition ${
												selected
													? "border-amber-500/40 bg-amber-500/10 text-amber-200"
													: "border-stone-800 bg-stone-950/60 text-stone-400 hover:border-stone-600 hover:text-stone-200"
											}`}
										>
											<Icon
												className={`size-3.5 shrink-0 ${
													selected
														? "text-amber-400"
														: "text-stone-500"
												}`}
											/>
											{s.label}
										</button>
									);
								})}
							</div>
						</div>

						<AnimatePresence initial={false}>
							{hasCustom ? (
								<motion.button
									key="reset"
									type="button"
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									onClick={() => {
										setFilter("all");
										setSort("newest");
									}}
									className="flex w-full cursor-pointer items-center justify-center gap-1.5 overflow-hidden text-xs font-medium text-stone-500 transition hover:text-stone-300"
								>
									<RotateCcw className="size-3.5" />
									Сбросить всё
								</motion.button>
							) : null}
						</AnimatePresence>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}
