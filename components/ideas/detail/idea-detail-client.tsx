"use client";

import { IdeaDetailHeader } from "@/components/ideas/detail/idea-detail-header";
import { IdeaDetailPending } from "@/components/ideas/detail/idea-detail-pending";
import { IdeaDetailBackLink } from "@/components/ideas/detail/idea-detail-back-nav";
import { RichAnalysisReport } from "@/components/ideas/detail/rich/rich-analysis-report";
import { useIdeasDemo } from "@/components/ideas/ideas-demo-provider";
import { buildRichMockReport } from "@/lib/analysis/rich-mock";
import type { RichAnalysisReport as RichReport } from "@/lib/analysis/rich-types";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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

	const idea = ideas.find((i) => i.id === id);
	const report = useMemo(() => {
		if (!idea) return null;
		if (generated) return generated;
		if (idea.hasAnalysis && idea.score != null) {
			return buildRichMockReport(idea);
		}
		return null;
	}, [idea, generated]);

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
					if (!hasAnalysis) return;
					const result = await analyzeIdea(idea.id, "update");
					if (result === "insufficient") {
						openWallet();
						return;
					}
					if (result !== "ok") return;
					const next = (report?.version ?? 1) + 1;
					setGenerated(buildRichMockReport(idea, next));
				}}
			/>

			<div className="mt-5">
				{report ? (
					<RichAnalysisReport report={report} />
				) : (
					<IdeaDetailPending
						idea={idea}
						onAnalyzed={() => {
							const fresh = buildRichMockReport(idea);
							setGenerated(fresh);
							markIdeaAnalyzed(idea.id, fresh.score);
						}}
					/>
				)}
			</div>
		</motion.div>
	);
}
