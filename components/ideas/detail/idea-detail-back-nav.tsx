"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const IDEAS_HREF = "/app/ideas";

export function IdeaDetailBackLink() {
	return (
		<Link
			href={IDEAS_HREF}
			className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-stone-700/80 bg-stone-900/80 text-stone-400 transition hover:border-stone-600 hover:text-stone-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
			aria-label="К списку идей"
		>
			<ArrowLeft className="size-4" />
		</Link>
	);
}
