import { SitePageBackdrop } from "@/components/site/site-page-backdrop";
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
		<SitePageBackdrop>
			<main className="relative z-10 mx-auto max-w-3xl px-5 py-8 sm:px-6 sm:py-10">
				<header className="border-b border-stone-800 pb-6">
					<h1 className="text-balance text-2xl font-bold tracking-tight text-stone-50 sm:text-[1.75rem]">
						{title}
					</h1>
					<p className="mt-1.5 max-w-2xl text-pretty text-sm leading-relaxed text-stone-400">
						{description}
					</p>
					<p className="mt-2 text-xs text-stone-500">
						Действует с {LEGAL_EFFECTIVE_DATE}
					</p>
				</header>

				<div className="mt-6">{children}</div>

				<nav
					className="mt-10 border-t border-stone-800 pt-6"
					aria-label="Другие документы"
				>
					<p className="text-xs font-medium uppercase tracking-wide text-stone-500">
						Документы
					</p>
					<ul className="mt-3 flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-1.5">
						{LEGAL_PAGES.map((page) => (
							<li key={page.href}>
								{page.href === currentHref ? (
									<span
										className="text-sm font-medium text-stone-100"
										aria-current="page"
									>
										{page.title}
									</span>
								) : (
									<Link
										href={page.href}
										className="text-sm text-stone-400 underline decoration-stone-600 underline-offset-2 transition hover:text-stone-200 hover:decoration-stone-400"
									>
										{page.title}
									</Link>
								)}
							</li>
						))}
					</ul>
				</nav>
			</main>
		</SitePageBackdrop>
	);
}
