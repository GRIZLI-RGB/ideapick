"use client";

import { useIdeasDemo } from "@/components/ideas/ideas-demo-provider";
import { PRICES } from "@/lib/ideas/constants";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ClipboardList, Plus, Shuffle, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const ITEMS = [
	{
		mode: "create" as const,
		label: "Своя идея",
		desc: "Название и описание",
		price: "0 ₽",
		icon: Plus,
	},
	{
		mode: "random" as const,
		label: "Из каталога",
		desc: "Случайная готовая идея",
		price: "0 ₽",
		icon: Shuffle,
	},
	{
		mode: "anamnesis" as const,
		label: "По анамнезу",
		desc: "Короткий опрос → AI",
		price: `${PRICES.anamnesis} ₽`,
		icon: Sparkles,
	},
];

type AddIdeaMenuProps = {
	variant?: "primary" | "inline";
};

export function AddIdeaMenu({ variant = "primary" }: AddIdeaMenuProps) {
	const { openDialog, randomUsedToday, randomLimit } = useIdeasDemo();
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

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

	const randomLeft = randomLimit - randomUsedToday;

	return (
		<div className="relative" ref={ref}>
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className={
					variant === "primary"
						? "flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
						: "flex cursor-pointer items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-900 px-3 py-1.5 text-xs font-medium text-stone-200 transition hover:border-stone-600 hover:bg-stone-800 sm:text-sm"
				}
			>
				<Plus className="size-4" />
				Идея
				<ChevronDown
					className={`size-4 transition ${open ? "rotate-180" : ""}`}
				/>
			</button>

			<AnimatePresence>
				{open ? (
					<motion.div
						initial={{ opacity: 0, y: 6, scale: 0.98 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 4, scale: 0.98 }}
						transition={{ duration: 0.15 }}
						className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-stone-700/80 bg-stone-900 shadow-2xl shadow-black/50 ring-1 ring-white/5"
					>
						{ITEMS.map((item) => {
							const Icon = item.icon;
							const disabled =
								item.mode === "random" && randomLeft <= 0;
							return (
								<button
									key={item.mode}
									type="button"
									disabled={disabled}
									onClick={() => {
										setOpen(false);
										openDialog(item.mode);
									}}
									className="flex w-full cursor-pointer items-start gap-3 border-b border-stone-800/80 px-4 py-3.5 text-left transition last:border-0 hover:bg-stone-800/60 disabled:cursor-not-allowed disabled:opacity-45"
								>
									<div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-stone-800 text-amber-400">
										<Icon className="size-4" />
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex items-center justify-between gap-2">
											<span className="text-sm font-medium text-stone-100">
												{item.label}
											</span>
											<span className="shrink-0 text-xs font-medium text-stone-500">
												{item.price}
											</span>
										</div>
										<p className="mt-0.5 text-xs text-stone-500">
											{item.desc}
											{item.mode === "random" ? (
												<span className="text-stone-600">
													{" "}
													· осталось {Math.max(0, randomLeft)}/{randomLimit}{" "}
													сегодня
												</span>
											) : null}
										</p>
									</div>
								</button>
							);
						})}
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}

export function QuickActionCard({
	mode,
	title,
	description,
	price,
}: {
	mode: "create" | "random" | "anamnesis";
	title: string;
	description: string;
	price: string;
}) {
	const { openDialog, randomUsedToday, randomLimit } = useIdeasDemo();
	const disabled = mode === "random" && randomLimit - randomUsedToday <= 0;
	const icons = { create: Plus, random: Shuffle, anamnesis: ClipboardList };

	const Icon = icons[mode];

	return (
		<button
			type="button"
			disabled={disabled}
			onClick={() => openDialog(mode)}
			className="group flex cursor-pointer flex-col rounded-2xl border border-stone-800/80 bg-stone-900/40 p-4 text-left transition hover:border-amber-500/25 hover:bg-stone-900/70 disabled:cursor-not-allowed disabled:opacity-45 sm:p-5"
		>
			<div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-stone-800 text-amber-400 transition group-hover:bg-amber-500/10">
				<Icon className="size-5" />
			</div>
			<h3 className="text-sm font-semibold text-stone-100">{title}</h3>
			<p className="mt-1 flex-1 text-xs leading-relaxed text-stone-500">
				{description}
			</p>
			<span className="mt-3 text-xs font-medium text-amber-500/90">{price}</span>
		</button>
	);
}
