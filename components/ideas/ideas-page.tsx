"use client";

import { EmptyState } from "@/components/ideas/empty-state";
import { IdeaCard } from "@/components/ideas/idea-card";
import { useIdeasDemo } from "@/components/ideas/ideas-demo-provider";
import { IdeasToolbar } from "@/components/ideas/ideas-toolbar";

export function IdeasPage() {
	const { ideas, filteredIdeas, filter } = useIdeasDemo();

	// Идей нет вообще — без тулбара, только приветственный экран.
	if (ideas.length === 0) {
		return (
			<div className="pb-8">
				<EmptyState />
			</div>
		);
	}

	return (
		<div className="space-y-6 pb-8">
			<IdeasToolbar />

			{filteredIdeas.length === 0 ? (
				<p className="rounded-2xl border border-stone-800/80 bg-stone-900/40 px-6 py-10 text-center text-sm text-stone-500">
					{filter === "archived"
						? "В архиве пусто. Перенести идею в архив можно с её страницы — через меню действий."
						: "Под выбранный фильтр ничего не попадает — измените фильтр или добавьте новую идею."}
				</p>
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
