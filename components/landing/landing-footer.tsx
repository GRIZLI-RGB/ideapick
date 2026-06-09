import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";

export function LandingFooter() {
	return (
		<footer className="relative border-t border-stone-800/70 px-5 py-12 sm:px-6">
			<div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 sm:flex-row sm:items-start">
				<div className="text-center sm:text-left">
					<Link href="/" className="inline-flex items-center gap-2.5">
						<BrandMark size={26} />
						<span className="text-sm font-semibold tracking-tight text-stone-100">
							Ideapick
						</span>
					</Link>
					<p className="mt-3 max-w-xs text-sm leading-relaxed text-stone-500">
						AI-оценка бизнес-идей: от идеи до обоснованного вердикта
						«стоит ли браться».
					</p>
				</div>

				<nav
					className="flex flex-col items-center gap-2.5 text-sm sm:items-end"
					aria-label="Подвал"
				>
					<Link
						href="/login"
						className="text-stone-400 transition hover:text-stone-100"
					>
						Войти
					</Link>
					<Link
						href="/terms"
						className="text-stone-400 transition hover:text-stone-100"
					>
						Условия
					</Link>
					<Link
						href="/privacy"
						className="text-stone-400 transition hover:text-stone-100"
					>
						Конфиденциальность
					</Link>
				</nav>
			</div>

			<div className="mx-auto mt-10 flex max-w-6xl flex-col gap-1 border-t border-stone-800/60 pt-6 text-xs text-stone-600 sm:flex-row sm:items-center sm:justify-between">
				<p>© {new Date().getFullYear()} Ideapick · ideapick.ru</p>
				<p>Оценка AI — рекомендация, не инвестиционный совет.</p>
			</div>
		</footer>
	);
}
