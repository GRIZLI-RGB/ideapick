import { LEGAL_PAGES, LEGAL_EFFECTIVE_DATE } from "@/lib/legal";
import Link from "next/link";

type LegalPageShellProps = {
	title: string;
	description: string;
	currentHref: string;
	children: React.ReactNode;
};

export function LegalPageShell({
	title,
	description,
	currentHref,
	children,
}: LegalPageShellProps) {
	return (
		<div className="min-h-dvh bg-white">
			<main className="mx-auto max-w-3xl px-5 py-8 sm:px-6 sm:py-10">
				<header className="border-b border-zinc-100 pb-6">
					<h1 className="text-balance text-2xl font-bold tracking-tight text-zinc-900 sm:text-[1.75rem]">
						{title}
					</h1>
					<p className="mt-1.5 max-w-2xl text-pretty text-sm leading-relaxed text-zinc-500">
						{description}
					</p>
					<p className="mt-2 text-xs text-zinc-400">
						Действует с {LEGAL_EFFECTIVE_DATE}
					</p>
				</header>

				<div className="mt-6">{children}</div>

				<nav
					className="mt-10 border-t border-zinc-100 pt-6"
					aria-label="Другие документы"
				>
					<p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
						Документы
					</p>
					<ul className="mt-3 flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-1.5">
						{LEGAL_PAGES.map((page) => (
							<li key={page.href}>
								{page.href === currentHref ? (
									<span
										className="text-sm font-medium text-zinc-900"
										aria-current="page"
									>
										{page.title}
									</span>
								) : (
									<Link
										href={page.href}
										className="text-sm text-zinc-600 underline decoration-zinc-300 underline-offset-2 transition hover:text-zinc-900 hover:decoration-zinc-500"
									>
										{page.title}
									</Link>
								)}
							</li>
						))}
					</ul>
				</nav>
			</main>
		</div>
	);
}
