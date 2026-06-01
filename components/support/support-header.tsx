import { Headphones, Plus } from "lucide-react";
import Link from "next/link";

export function SupportHeader() {
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<header>
				<h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-stone-50 sm:text-3xl">
					<Headphones className="size-7 text-amber-400/90 sm:size-8" />
					Поддержка
				</h1>
			</header>
			<Link
				href="/app/support/new"
				className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
			>
				<Plus className="size-4" />
				Новое обращение
			</Link>
		</div>
	);
}
