"use client";

import type { Idea } from "@/lib/ideas/types";
import { AnimatePresence, motion } from "framer-motion";
import {
	Archive,
	ArchiveRestore,
	MoreHorizontal,
	RefreshCw,
	Trash2,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

type IdeaDetailActionsProps = {
	idea: Idea;
	hasAnalysis: boolean;
	archived?: boolean;
	onArchive: () => void;
	onRestore: () => void;
	onDelete: () => void;
	onUpdateAnalysis?: () => void;
};

const MENU_CLASS =
	"absolute right-0 z-50 mt-2 w-56 origin-top-right overflow-hidden rounded-xl border border-stone-700/80 bg-stone-900 shadow-2xl shadow-black/50 ring-1 ring-white/5";

const TRIGGER_BTN =
	"flex size-9 cursor-pointer items-center justify-center rounded-xl border border-stone-700/80 bg-stone-900/80 text-stone-400 transition hover:border-stone-600 hover:text-stone-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40";

export function IdeaDetailActions({
	idea,
	hasAnalysis,
	archived = false,
	onArchive,
	onRestore,
	onDelete,
	onUpdateAnalysis,
}: IdeaDetailActionsProps) {
	const [open, setOpen] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const menuId = useId();
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) {
			setConfirmDelete(false);
			return;
		}
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
		<div className="relative shrink-0" ref={ref}>
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className={TRIGGER_BTN}
				aria-expanded={open}
				aria-haspopup="menu"
				aria-controls={menuId}
				aria-label="Действия с идеей"
			>
				<MoreHorizontal className="size-4" />
			</button>

			<AnimatePresence>
				{open ? (
					<motion.div
						id={menuId}
						role="menu"
						initial={{ opacity: 0, y: 4, scale: 0.98 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 2, scale: 0.98 }}
						transition={{ duration: 0.12 }}
						className={MENU_CLASS}
					>
						{hasAnalysis && onUpdateAnalysis ? (
							<button
								type="button"
								role="menuitem"
								onClick={() => {
									setOpen(false);
									onUpdateAnalysis();
								}}
								className="flex w-full cursor-pointer items-center gap-2.5 border-b border-stone-800/80 px-3.5 py-2.5 text-left text-sm text-stone-200 transition hover:bg-stone-800/60"
							>
								<RefreshCw className="size-4 text-amber-400/90" />
								Обновить анализ · 99 ₽
							</button>
						) : null}

						{archived ? (
							<button
								type="button"
								role="menuitem"
								onClick={() => {
									setOpen(false);
									onRestore();
								}}
								className="flex w-full cursor-pointer items-center gap-2.5 border-b border-stone-800/80 px-3.5 py-2.5 text-left text-sm text-stone-200 transition hover:bg-stone-800/60"
							>
								<ArchiveRestore className="size-4 text-stone-400" />
								Вернуть из архива
							</button>
						) : (
							<button
								type="button"
								role="menuitem"
								onClick={() => {
									setOpen(false);
									onArchive();
								}}
								className="flex w-full cursor-pointer items-center gap-2.5 border-b border-stone-800/80 px-3.5 py-2.5 text-left text-sm text-stone-200 transition hover:bg-stone-800/60"
							>
								<Archive className="size-4 text-stone-400" />
								Перенести в архив
							</button>
						)}

						{confirmDelete && hasAnalysis ? (
							<div className="border-b border-stone-800/80 p-3">
								<p className="text-xs leading-relaxed text-stone-400">
									Удалить «{idea.title}»? Отчёт анализа пропадёт без
									восстановления.
								</p>
								<div className="mt-2 flex gap-2">
									<button
										type="button"
										onClick={() => {
											setOpen(false);
											onDelete();
										}}
										className="flex-1 cursor-pointer rounded-lg bg-rose-500/15 px-2 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-500/25"
									>
										Удалить
									</button>
									<button
										type="button"
										onClick={() => setConfirmDelete(false)}
										className="flex-1 cursor-pointer rounded-lg bg-stone-800 px-2 py-1.5 text-xs text-stone-300 transition hover:bg-stone-700"
									>
										Отмена
									</button>
								</div>
							</div>
						) : (
							<button
								type="button"
								role="menuitem"
								onClick={() => {
									if (hasAnalysis) {
										setConfirmDelete(true);
										return;
									}
									setOpen(false);
									onDelete();
								}}
								className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-rose-300/90 transition hover:bg-stone-800/60"
							>
								<Trash2 className="size-4" />
								Удалить навсегда
							</button>
						)}
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}
