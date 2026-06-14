"use client";

import { IdeaDetailAnalyzing } from "@/components/ideas/detail/idea-detail-analyzing";
import { IdeaDetailHeader } from "@/components/ideas/detail/idea-detail-header";
import { IdeaDetailPending } from "@/components/ideas/detail/idea-detail-pending";
import { IdeaDetailBackLink } from "@/components/ideas/detail/idea-detail-back-nav";
import { RichAnalysisReport } from "@/components/ideas/detail/rich/rich-analysis-report";
import { useIdeasDemo } from "@/components/ideas/ideas-demo-provider";
import { buildRichMockReport } from "@/lib/analysis/rich-mock";
import type { RichAnalysisReport as RichReport } from "@/lib/analysis/rich-types";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

type IdeaDetailClientProps = {
	id: string;
};

export function IdeaDetailClient({ id }: IdeaDetailClientProps) {
	const router = useRouter();
	const { ideas, deleteIdea, setIdeaArchived, analyzeIdea, markIdeaAnalyzed, openWallet } =
		useIdeasDemo();
	const [deleting, setDeleting] = useState(false);
	/** Отчёт текущей сессии (обновления версии); при reload берётся из buildRichMockReport. */
	const [generated, setGenerated] = useState<RichReport | null>(null);
	/** Повторный анализ: после списания показываем те же шаги, что при первом запуске. */
	const [refreshing, setRefreshing] = useState(false);
	const [refreshFromVersion, setRefreshFromVersion] = useState(1);

	const idea = ideas.find((i) => i.id === id);
	const report = useMemo(() => {
		if (!idea) return null;
		if (generated) return generated;
		if (idea.hasAnalysis && idea.score != null) {
			return buildRichMockReport(idea);
		}
		return null;
	}, [idea, generated]);

	const completeRefresh = useCallback(() => {
		if (!idea) return;
		setGenerated(buildRichMockReport(idea, refreshFromVersion + 1));
		setRefreshing(false);
	}, [idea, refreshFromVersion]);

	const handleFirstAnalyzed = useCallback(() => {
		if (!idea) return;
		const fresh = buildRichMockReport(idea);
		setGenerated(fresh);
		markIdeaAnalyzed(idea.id, fresh.score);
	}, [idea, markIdeaAnalyzed]);

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
				onUpdateAnalysis={async () => {
					if (!hasAnalysis || refreshing) return;
					const result = await analyzeIdea(idea.id, "update");
					if (result === "insufficient") {
						openWallet();
						return;
					}
					if (result !== "ok") return;
					setRefreshFromVersion(report?.version ?? 1);
					setRefreshing(true);
				}}
			/>

			<div className="mt-5">
				{refreshing ? (
					<IdeaDetailAnalyzing
						key={`refresh-${refreshFromVersion}`}
						title={idea.title}
						onComplete={completeRefresh}
					/>
				) : report ? (
					<RichAnalysisReport report={report} />
				) : (
					<IdeaDetailPending
						idea={idea}
						onAnalyzed={handleFirstAnalyzed}
					/>
				)}
			</div>
		</motion.div>
	);
}
