"use client";

import { IdeaAnalysisReport } from "@/components/ideas/detail/idea-analysis-report";
import { IdeaDetailHeader } from "@/components/ideas/detail/idea-detail-header";
import { IdeaDetailPending } from "@/components/ideas/detail/idea-detail-pending";
import { IdeaDetailBackLink } from "@/components/ideas/detail/idea-detail-back-nav";
import { RichAnalysisReport } from "@/components/ideas/detail/rich/rich-analysis-report";
import { useIdeasDemo } from "@/components/ideas/ideas-demo-provider";
import { getMockAnalysisReport } from "@/lib/analysis/mock-reports";
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
	const { ideas, deleteIdea, setIdeaArchived } = useIdeasDemo();
	const [deleting, setDeleting] = useState(false);
	const [generated, setGenerated] = useState<RichReport | null>(null);

	const idea = ideas.find((i) => i.id === id);
	const report = useMemo(
		() => (idea ? getMockAnalysisReport(idea) : null),
		[idea],
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

	const hasAnalysis = Boolean(report) || Boolean(generated);

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
					if (!generated) return;
					const next = generated.version + 1;
					setGenerated(buildRichMockReport(idea, next));
				}}
			/>

			<div className="mt-5">
				{generated ? (
					<RichAnalysisReport report={generated} />
				) : report ? (
					<IdeaAnalysisReport report={report} />
				) : (
					<IdeaDetailPending
						idea={idea}
						onAnalyzed={() =>
							setGenerated(buildRichMockReport(idea))
						}
					/>
				)}
			</div>
		</motion.div>
	);
}
