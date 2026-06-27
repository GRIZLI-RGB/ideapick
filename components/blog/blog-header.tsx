import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";

/** Лёгкая шапка для публичных страниц блога. */
export function BlogHeader() {
	return (
		<header className="sticky top-0 z-40 border-b border-stone-800/60 bg-stone-950/80 backdrop-blur-xl">
			<nav className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:px-6">
				<Link
					href="/"
					className="flex shrink-0 items-center gap-2.5 rounded-lg outline-none transition hover:opacity-90"
				>
					<BrandMark size={28} />
					<span className="text-[0.9375rem] font-semibold tracking-tight text-stone-100">
						Ideapick
					</span>
				</Link>
				<div className="flex items-center gap-1.5 sm:gap-3">
					<Link
						href="/blog"
						className="rounded-lg px-3 py-2 text-sm font-medium text-stone-300 transition hover:text-stone-100"
					>
						Блог
					</Link>
					<Link
						href="/login"
						className="group inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-stone-950 shadow-md shadow-amber-500/20 transition hover:bg-amber-400 sm:px-4"
					>
						Проверить идею
						<ArrowRight className="hidden size-4 transition-transform group-hover:translate-x-0.5 sm:block" />
					</Link>
				</div>
			</nav>
		</header>
	);
}
