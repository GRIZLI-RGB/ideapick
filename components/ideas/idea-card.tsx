"use client";

import Link from "next/link";
import type { Idea } from "@/lib/ideas/types";
import { IdeaScoreRing } from "@/components/ideas/idea-score-ring";
import { motion } from "framer-motion";
import { Archive } from "lucide-react";

type IdeaCardProps = {
	idea: Idea;
	index?: number;
};

export function IdeaCard({ idea, index = 0 }: IdeaCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.04, duration: 0.32 }}
			className="h-full"
		>
			<Link
				href={`/app/ideas/${idea.id}`}
				className="group flex h-full flex-col rounded-3xl border border-stone-800/50 bg-stone-900/30 p-5 transition hover:border-stone-700/60 hover:bg-stone-900/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 sm:p-6"
			>
				{idea.archived ? (
					<span className="mb-2.5 inline-flex w-max items-center gap-1 rounded-full border border-stone-700/60 bg-stone-800/60 px-2 py-0.5 text-[10px] font-medium text-stone-400">
						<Archive className="size-3" />
						В архиве
					</span>
				) : null}
				<div className="flex items-start justify-between gap-3">
					<h3 className="line-clamp-2 min-w-0 flex-1 text-lg font-semibold leading-snug tracking-tight text-stone-50 group-hover:text-amber-50">
						{idea.title}
					</h3>
					<IdeaScoreRing idea={idea} />
				</div>
				<p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-stone-400">
					{idea.description}
				</p>
			</Link>
		</motion.div>
	);
}
