"use client";

import { IdeaAnalysisReport } from "@/components/ideas/detail/idea-analysis-report";
import { IdeaDetailHeader } from "@/components/ideas/detail/idea-detail-header";
import { IdeaDetailPending } from "@/components/ideas/detail/idea-detail-pending";
import { IdeaDetailBackLink } from "@/components/ideas/detail/idea-detail-back-nav";
import { useIdeasDemo } from "@/components/ideas/ideas-demo-provider";
import { getMockAnalysisReport } from "@/lib/analysis/mock-reports";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

type IdeaDetailClientProps = {
	id: string;
};

export function IdeaDetailClient({ id }: IdeaDetailClientProps) {
	const router = useRouter();
	const { ideas } = useIdeasDemo();

	const idea = ideas.find((i) => i.id === id);
	const report = useMemo(
		() => (idea ? getMockAnalysisReport(idea) : null),
		[idea],
	);

	if (!idea) {
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
				onArchive={() => router.push("/app/ideas")}
				onRestore={() => {}}
				onDelete={() => router.push("/app/ideas")}
				onUpdateAnalysis={() => {}}
			/>

			<div className="mt-5">
				{report ? (
					<IdeaAnalysisReport report={report} />
				) : (
					<IdeaDetailPending idea={idea} />
				)}
			</div>
		</motion.div>
	);
}
