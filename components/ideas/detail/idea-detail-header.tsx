"use client";

import { IdeaDetailActions } from "@/components/ideas/detail/idea-detail-actions";
import { IdeaDetailBackLink } from "@/components/ideas/detail/idea-detail-back-nav";
import type { Idea } from "@/lib/ideas/types";

type IdeaDetailHeaderProps = {
	idea: Idea;
	hasAnalysis: boolean;
	onArchive: () => void;
	onRestore: () => void;
	onDelete: () => void;
	onUpdateAnalysis?: () => void;
};

export function IdeaDetailHeader({
	idea,
	hasAnalysis,
	onArchive,
	onRestore,
	onDelete,
	onUpdateAnalysis,
}: IdeaDetailHeaderProps) {
	return (
		<header className="flex items-center gap-3 sm:gap-4">
			<IdeaDetailBackLink />
			<h1 className="min-w-0 flex-1 truncate text-lg font-bold tracking-tight text-stone-50 sm:text-2xl">
				{idea.title}
			</h1>
			<IdeaDetailActions
				idea={idea}
				hasAnalysis={hasAnalysis}
				archived={idea.archived}
				onArchive={onArchive}
				onRestore={onRestore}
				onDelete={onDelete}
				onUpdateAnalysis={onUpdateAnalysis}
			/>
		</header>
	);
}
