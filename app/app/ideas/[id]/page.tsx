import { IdeaDetailClient } from "@/components/ideas/detail/idea-detail-client";
import { INITIAL_IDEAS } from "@/lib/ideas/mock-data";
import type { Metadata } from "next";
import { Suspense } from "react";

type PageProps = {
	params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { id } = await params;
	const idea = INITIAL_IDEAS.find((i) => i.id === id);
	return {
		title: idea ? `${idea.title} — Ideapick` : "Идея — Ideapick",
		description:
			"Детальная страница идеи с AI-анализом: оценка, спрос, конкуренция и следующие шаги.",
	};
}

function DetailFallback() {
	return (
		<div className="w-full animate-pulse space-y-4 pb-10 pt-8">
			<div className="h-4 w-32 rounded bg-stone-800" />
			<div className="h-8 w-3/4 rounded bg-stone-800" />
			<div className="h-24 rounded-2xl bg-stone-900/50" />
		</div>
	);
}

export default async function IdeaDetailPage({ params }: PageProps) {
	const { id } = await params;

	return (
		<Suspense fallback={<DetailFallback />}>
			<IdeaDetailClient id={id} />
		</Suspense>
	);
}
