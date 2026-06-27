import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import { OPERATOR } from "@/lib/legal";
import { Mail, Phone } from "lucide-react";
const SUPPORT_EMAIL = "support@ideapick.ru";

const FOOTER_LINKS = [
	{ href: "/blog", label: "Блог" },
	{ href: "/terms", label: "Условия использования" },
	{ href: "/privacy", label: "Конфиденциальность" },
];

export function LandingFooter() {
	return (
		<footer className="relative px-5 pt-10 pb-6 sm:px-6">
			<div
				className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-700/50 to-transparent"
				aria-hidden
			/>
			<div
				className="pointer-events-none absolute left-1/2 top-0 h-px w-48 -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"
				aria-hidden
			/>

			<div className="mx-auto max-w-6xl">
				<div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
					<Link
						href="/"
						className="inline-flex items-center gap-2.5 transition hover:opacity-90"
					>
						<BrandMark size={26} />
						<span className="text-[0.9375rem] font-semibold tracking-tight text-stone-100">
							Ideapick
						</span>
					</Link>

					<nav
						aria-label="Документы и контакты"
						className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
					>
						{FOOTER_LINKS.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="text-sm text-stone-400 transition hover:text-stone-100"
							>
								{link.label}
							</Link>
						))}
						<a
							href={`mailto:${SUPPORT_EMAIL}`}
							className="inline-flex items-center gap-1.5 rounded-lg border border-stone-800/80 bg-stone-900/40 px-2.5 py-1 text-sm text-stone-300 transition hover:border-stone-700 hover:text-stone-100"
						>
							<Mail
								className="size-3.5 shrink-0 text-amber-400/80"
								aria-hidden
							/>
							{SUPPORT_EMAIL}
						</a>
						<a
							href={`tel:${OPERATOR.phoneHref}`}
							className="inline-flex items-center gap-1.5 rounded-lg border border-stone-800/80 bg-stone-900/40 px-2.5 py-1 text-sm text-stone-300 transition hover:border-stone-700 hover:text-stone-100"
						>
							<Phone
								className="size-3.5 shrink-0 text-amber-400/80"
								aria-hidden
							/>
							{OPERATOR.phone}
						</a>
					</nav>
				</div>

				<div className="mt-10 flex flex-col items-center gap-1.5 border-t border-stone-800/60 pt-6 text-xs text-stone-500 sm:flex-row sm:justify-between">
					<p>© {new Date().getFullYear()} Ideapick</p>
					<p>
						{OPERATOR.name} · ИНН {OPERATOR.inn}
					</p>
				</div>
			</div>
		</footer>
	);
}
