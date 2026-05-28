"use client";

import { EmptyState } from "@/components/ideas/empty-state";
import { IdeaCard } from "@/components/ideas/idea-card";
import { useIdeasDemo } from "@/components/ideas/ideas-demo-provider";
import { IdeasToolbar } from "@/components/ideas/ideas-toolbar";

export function IdeasPage() {
	const { filteredIdeas } = useIdeasDemo();

	return (
		<div className="space-y-6 pb-8">
			<IdeasToolbar />

			{filteredIdeas.length === 0 ? (
				<EmptyState />
			) : (
				<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
					{filteredIdeas.map((idea, i) => (
						<IdeaCard key={idea.id} idea={idea} index={i} />
					))}
				</div>
			)}
		</div>
	);
}
