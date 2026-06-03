"use client";

import type { AnalysisReport } from "@/lib/analysis/types";
import type { ReportSectionKey } from "@/lib/analysis/section-meta";
import { sectionMeta } from "@/lib/analysis/report-helpers";
import { ReportSectionBody } from "@/components/ideas/detail/report-sections";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

type SectionDetailSheetProps = {
	report: AnalysisReport;
	sectionKey: ReportSectionKey | null;
	onClose: () => void;
};

export function SectionDetailSheet({
	report,
	sectionKey,
	onClose,
}: SectionDetailSheetProps) {
	useEffect(() => {
		if (!sectionKey) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.body.style.overflow = "hidden";
		window.addEventListener("keydown", onKey);
		return () => {
			document.body.style.overflow = "";
			window.removeEventListener("keydown", onKey);
		};
	}, [sectionKey, onClose]);

	const meta = sectionKey ? sectionMeta(sectionKey) : null;
	const Icon = meta?.icon;

	return (
		<AnimatePresence>
			{sectionKey && meta && Icon ? (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
					onClick={onClose}
				>
					<motion.div
						initial={{ opacity: 0, y: 32 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 24 }}
						transition={{ type: "spring", damping: 28, stiffness: 320 }}
						className="flex max-h-[min(85dvh,640px)] w-full flex-col overflow-hidden rounded-t-2xl border border-stone-700/80 bg-stone-900 shadow-2xl sm:max-w-lg sm:rounded-2xl"
						onClick={(e) => e.stopPropagation()}
						role="dialog"
						aria-modal="true"
						aria-labelledby="section-sheet-title"
					>
						<div className="flex items-start justify-between gap-3 border-b border-stone-800/80 px-5 py-4">
							<div className="flex items-center gap-3">
								<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-stone-800/80">
									<Icon className="size-4 text-amber-400/90" />
								</div>
								<h2
									id="section-sheet-title"
									className="text-base font-semibold text-stone-100"
								>
									{meta.label}
								</h2>
							</div>
							<button
								type="button"
								onClick={onClose}
								className="cursor-pointer rounded-lg p-1.5 text-stone-500 transition hover:bg-stone-800 hover:text-stone-300"
								aria-label="Закрыть"
							>
								<X className="size-4" />
							</button>
						</div>
						<div className="overflow-y-auto px-5 py-4">
							<ReportSectionBody sectionKey={sectionKey} report={report} />
						</div>
					</motion.div>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
