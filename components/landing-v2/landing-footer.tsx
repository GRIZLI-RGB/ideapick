import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import { OPERATOR } from "@/lib/legal";

const SUPPORT_EMAIL = "support@ideapick.ru";

const FOOTER_LINKS = [
	{ href: "/terms", label: "Условия использования" },
	{ href: "/privacy", label: "Конфиденциальность" },
];

export function LandingFooter() {
	return (
		<footer className="relative px-5 py-10 sm:px-6">
			{/* Мягкий разделитель с янтарным акцентом по центру */}
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
						aria-label="Футер"
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
							className="text-sm text-stone-400 transition hover:text-stone-100"
						>
							{SUPPORT_EMAIL}
						</a>
					</nav>
				</div>

				<div className="mt-7 flex flex-col items-center gap-1.5 border-t border-stone-800/60 pt-5 text-xs text-stone-500 sm:flex-row sm:justify-between">
					<p>© {new Date().getFullYear()} Ideapick</p>
					<p>
						{OPERATOR.name} · ИНН {OPERATOR.inn}
					</p>
				</div>
			</div>
		</footer>
	);
}
