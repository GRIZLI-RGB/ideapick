"use client";

import { IdeaDetailAnalyzing } from "@/components/ideas/detail/idea-detail-analyzing";
import { IdeaDetailHeader } from "@/components/ideas/detail/idea-detail-header";
import { IdeaDetailFailed } from "@/components/ideas/detail/idea-detail-failed";
import { IdeaDetailPending } from "@/components/ideas/detail/idea-detail-pending";
import { IdeaDetailBackLink } from "@/components/ideas/detail/idea-detail-back-nav";
import { RichAnalysisReport } from "@/components/ideas/detail/rich/rich-analysis-report";
import { useIdeasDemo } from "@/components/ideas/ideas-demo-provider";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

type IdeaDetailClientProps = {
	id: string;
};

export function IdeaDetailClient({ id }: IdeaDetailClientProps) {
	const router = useRouter();
	const { ideas, deleteIdea, setIdeaArchived, analyzeIdea, openWallet } =
		useIdeasDemo();
	const [deleting, setDeleting] = useState(false);
	/** Идёт запуск анализа (списание + генерация на сервере). */
	const [analyzing, setAnalyzing] = useState(false);
	/** Анимация прогресса доиграла до конца. */
	const animationDoneRef = useRef(false);
	/** Отчёт пришёл с сервера. */
	const reportReadyRef = useRef(false);

	const idea = ideas.find((i) => i.id === id);
	const report = idea?.report ?? null;

	// Снимаем оверлей только когда и анимация доиграла, и отчёт готов.
	const finishIfReady = useCallback(() => {
		if (animationDoneRef.current && reportReadyRef.current) {
			setAnalyzing(false);
		}
	}, []);

	const startAnalysis = useCallback(
		async (mode: "initial" | "update") => {
			if (analyzing) return;
			animationDoneRef.current = false;
			reportReadyRef.current = false;
			setAnalyzing(true);

			const result = await analyzeIdea(id, mode);
			if (result === "insufficient") {
				setAnalyzing(false);
				openWallet();
				return;
			}
			if (result === "error") {
				setAnalyzing(false);
				return;
			}
			// Успех: отчёт уже в состоянии идеи — дожидаемся конца анимации.
			reportReadyRef.current = true;
			finishIfReady();
		},
		[analyzing, analyzeIdea, id, openWallet, finishIfReady],
	);

	if (!idea) {
		// Во время удаления идея уже убрана из состояния — не мигаем «не найдено»,
		// просто ждём перехода к списку.
		if (deleting) return null;
		return (
			<div className="w-full pb-10">
				<IdeaDetailBackLink />
				<p className="mt-8 text-stone-500">Идея не найдена.</p>
			</div>
		);
	}

	const hasAnalysis = Boolean(report);

	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.28 }}
			className="w-full pb-10"
		>
			<IdeaDetailHeader
				idea={idea}
				hasAnalysis={hasAnalysis}
				onArchive={async () => {
					// Архив скрывает идею из основного списка — возвращаемся к нему.
					router.push("/app/ideas");
					await setIdeaArchived(idea.id, true);
				}}
				onRestore={() => setIdeaArchived(idea.id, false)}
				onDelete={async () => {
					setDeleting(true);
					router.push("/app/ideas");
					await deleteIdea(idea.id);
				}}
				onUpdateAnalysis={() => {
					if (!hasAnalysis || analyzing) return;
					void startAnalysis("update");
				}}
			/>

			<div className="mt-5">
				{analyzing ? (
					<IdeaDetailAnalyzing
						key={`analyze-${report?.version ?? 0}`}
						title={idea.title}
						onComplete={() => {
							animationDoneRef.current = true;
							finishIfReady();
						}}
					/>
				) : report ? (
					<RichAnalysisReport report={report} />
				) : idea.analysisStatus === "failed" ? (
					<IdeaDetailFailed onRetry={() => void startAnalysis("initial")} />
				) : (
					<IdeaDetailPending
						onAnalyze={() => void startAnalysis("initial")}
					/>
				)}
			</div>
		</motion.div>
	);
}
