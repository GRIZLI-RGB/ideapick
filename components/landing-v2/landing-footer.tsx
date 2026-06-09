import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import { Mail } from "lucide-react";

const SUPPORT_EMAIL = "support@ideapick.ru";

const PRODUCT_LINKS = [
	{ href: "#how",     label: "Как это работает" },
	{ href: "#example", label: "Пример отчёта" },
	{ href: "#pricing", label: "Цены" },
	{ href: "#faq",     label: "Вопросы" },
];

const SERVICE_LINKS = [
	{ href: "/login",   label: "Войти" },
	{ href: "/terms",   label: "Условия использования" },
	{ href: "/privacy", label: "Конфиденциальность" },
];

export function LandingFooter() {
	return (
		<footer className="relative px-5 pb-10 pt-16 sm:px-6">
			{/* Мягкий разделитель с янтарным акцентом по центру */}
			<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-700/50 to-transparent" aria-hidden />
			<div className="pointer-events-none absolute left-1/2 top-0 h-px w-48 -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" aria-hidden />

			<div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-[1.4fr_1fr_1fr] sm:gap-8">
				{/* Бренд-блок */}
				<div>
					<Link href="/" className="inline-flex items-center gap-2.5">
						<BrandMark size={28} />
						<span className="text-[0.9375rem] font-semibold tracking-tight text-stone-100">
							IdeaPick
						</span>
					</Link>
					<p className="mt-4 max-w-xs text-sm leading-relaxed text-stone-400">
						Проверка бизнес-идей с помощью AI: вердикт 0–100 и план первых
						шагов за минуту.
					</p>
					<a
						href={`mailto:${SUPPORT_EMAIL}`}
						className="mt-5 inline-flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-900/50 px-3.5 py-2 text-sm text-stone-300 transition hover:border-stone-700 hover:text-stone-100"
					>
						<Mail className="size-4 text-amber-400/80" />
						{SUPPORT_EMAIL}
					</a>
				</div>

				{/* Разделы */}
				<nav aria-label="Разделы">
					<h3 className="text-xs font-semibold uppercase tracking-widest text-stone-500">
						Разделы
					</h3>
					<ul className="mt-4 space-y-2.5">
						{PRODUCT_LINKS.map((link) => (
							<li key={link.href}>
								<a
									href={link.href}
									className="text-sm text-stone-400 transition hover:text-stone-100"
								>
									{link.label}
								</a>
							</li>
						))}
					</ul>
				</nav>

				{/* Сервис */}
				<nav aria-label="Сервис">
					<h3 className="text-xs font-semibold uppercase tracking-widest text-stone-500">
						Сервис
					</h3>
					<ul className="mt-4 space-y-2.5">
						{SERVICE_LINKS.map((link) => (
							<li key={link.href}>
								<Link
									href={link.href}
									className="text-sm text-stone-400 transition hover:text-stone-100"
								>
									{link.label}
								</Link>
							</li>
						))}
					</ul>
				</nav>
			</div>

			<div className="mx-auto mt-12 flex max-w-6xl flex-col gap-1.5 border-t border-stone-800/60 pt-6 text-xs text-stone-600 sm:flex-row sm:items-center sm:justify-between">
				<p>© {new Date().getFullYear()} IdeaPick · ideapick.ru</p>
				<p>Оценка AI — рекомендация, не инвестиционный совет.</p>
			</div>
		</footer>
	);
}
