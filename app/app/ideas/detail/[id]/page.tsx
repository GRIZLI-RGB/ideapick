import { INITIAL_IDEAS } from "@/lib/ideas/mock-data";
import { VERDICTS } from "@/lib/ideas/constants";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

type PageProps = {
	params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { id } = await params;
	const idea = INITIAL_IDEAS.find((i) => i.id === id);
	return {
		title: idea ? `${idea.title} — Ideapick` : "Идея — Ideapick",
	};
}

export default async function IdeaDetailPage({ params }: PageProps) {
	const { id } = await params;
	const idea = INITIAL_IDEAS.find((i) => i.id === id);

	return (
		<div className="mx-auto max-w-2xl">
			<Link
				href="/app/ideas"
				className="inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-stone-300"
			>
				<ArrowLeft className="size-4" />
				К списку идей
			</Link>

			{idea ? (
				<article className="mt-6 rounded-2xl border border-stone-800/80 bg-stone-900/50 p-6">
					{idea.hasAnalysis && idea.verdict ? (
						<span
							className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${VERDICTS[idea.verdict].bg} ${VERDICTS[idea.verdict].color}`}
						>
							{VERDICTS[idea.verdict].label}
						</span>
					) : (
						<span className="text-xs text-stone-500">Без анализа</span>
					)}
					<h1 className="mt-3 text-2xl font-bold text-stone-50">{idea.title}</h1>
					<p className="mt-3 text-sm leading-relaxed text-stone-400">
						{idea.description}
					</p>
					{idea.score != null ? (
						<p className="mt-4 text-sm text-stone-500">
							Оценка AI:{" "}
							<span className="font-semibold text-amber-400">{idea.score}/100</span>
						</p>
					) : null}
					<p className="mt-6 rounded-xl border border-dashed border-stone-700 bg-stone-950/50 px-4 py-3 text-xs text-stone-500">
						Заглушка детальной карточки — редактирование, анализ и архив будут
						позже.
					</p>
				</article>
			) : (
				<p className="mt-6 text-stone-500">Идея не найдена в демо-данных.</p>
			)}
		</div>
	);
}
