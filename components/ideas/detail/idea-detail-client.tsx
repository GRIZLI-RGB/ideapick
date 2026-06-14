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
import { useCallback, useState } from "react";

type IdeaDetailClientProps = {
	id: string;
};

export function IdeaDetailClient({ id }: IdeaDetailClientProps) {
	const router = useRouter();
	const { ideas, deleteIdea, setIdeaArchived, analyzeIdea, openWallet } =
		useIdeasDemo();
	const [deleting, setDeleting] = useState(false);

	const idea = ideas.find((i) => i.id === id);
	const report = idea?.report ?? null;
	const status = idea?.analysisStatus ?? null;

	/**
	 * Вошли ли в цикл анализа. Поднимается при старте (или сразу, если идея уже
	 * считается — возобновление после перезагрузки) и больше не сбрасывается:
	 * видимостью оверлея дальше управляет производное `showOverlay`.
	 */
	const [inCycle, setInCycle] = useState(status === "pending");
	/** Интро-анимация прошла все шаги (держится на последнем до завершения). */
	const [animationDone, setAnimationDone] = useState(false);

	// Оверлей держим, пока (1) сервер не завершил запуск и (2) интро-анимация не
	// доиграла — чтобы появление отчёта ощущалось намеренным даже при мгновенном
	// ответе. Статусом анализа управляет сервер (поллинг в провайдере).
	const serverDone = status === "ok" || status === "failed";
	const showOverlay = inCycle && !(serverDone && animationDone);

	const handleAnimationComplete = useCallback(() => setAnimationDone(true), []);

	const startAnalysis = useCallback(
		async (mode: "initial" | "update") => {
			if (showOverlay) return;
			setAnimationDone(false);
			setInCycle(true);

			const result = await analyzeIdea(id, mode);
			if (result === "insufficient") {
				setInCycle(false);
				openWallet();
				return;
			}
			if (result === "error") {
				setInCycle(false);
				return;
			}
			// pending: дальше статус двигают поллинг провайдера; оверлей снимется,
			// когда статус станет ok/failed и доиграет анимация.
		},
		[showOverlay, analyzeIdea, id, openWallet],
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
					if (!hasAnalysis || showOverlay) return;
					void startAnalysis("update");
				}}
			/>

			<div className="mt-5">
				{showOverlay ? (
					<IdeaDetailAnalyzing
						title={idea.title}
						onComplete={handleAnimationComplete}
					/>
				) : report ? (
					<RichAnalysisReport report={report} />
				) : status === "failed" ? (
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
