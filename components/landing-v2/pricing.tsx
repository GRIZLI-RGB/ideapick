import Link from "next/link";
import { Reveal } from "@/components/landing-v2/reveal";
import { SectionHeading } from "@/components/landing-v2/section-heading";
import { PRICES, RANDOM_DAILY_LIMIT } from "@/lib/ideas/constants";
import { ArrowRight, Check, Gift, Wallet } from "lucide-react";

const ACTIONS: { label: string; price: string; hint: string; free?: boolean }[] = [
	{
		label: "AI-анализ идеи",
		price: `${PRICES.analysis} ₽`,
		hint:  "Полный отчёт и оценка 0–100",
	},
	{
		label: "Обновление анализа",
		price: `${PRICES.analysis} ₽`,
		hint:  "Пересчёт с учётом изменений рынка",
	},
	{
		label: "Идеи под ваш профиль",
		price: `${PRICES.anamnesis} ₽`,
		hint:  "Несколько идей по вашему опыту и интересам",
	},
	{
		label: "Идея из каталога",
		price: "0 ₽",
		hint:  `До ${RANDOM_DAILY_LIMIT} раз в сутки`,
		free:  true,
	},
	{
		label: "Создание и хранение идей",
		price: "0 ₽",
		hint:  "Без ограничений",
		free:  true,
	},
];

export function Pricing() {
	return (
		<section
			id="pricing"
			className="relative scroll-mt-20 px-5 py-20 sm:px-6 lg:py-28"
		>
			<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-700/40 to-transparent" aria-hidden />
			{/* Локальное свечение секции */}
			<div className="pointer-events-none absolute left-1/2 top-16 -z-10 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgb(245_158_11/0.06)_0%,transparent_65%)]" aria-hidden />

			<div className="mx-auto max-w-6xl">
				<SectionHeading
					eyebrow="Цены"
					title="Без подписки. Платите только за результат"
					description="Пополняете баланс в рублях — и тратите только на то, чем пользуетесь. Никаких ежемесячных списаний."
				/>

				<div className="mt-12 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
					{/* Бонус-карта */}
					<Reveal className="relative overflow-hidden rounded-3xl border border-amber-500/35 p-7">
						<div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/12 via-stone-900/60 to-stone-950/80" aria-hidden />
						<div className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-amber-500/20 blur-3xl" aria-hidden />
						<div className="pointer-events-none absolute -bottom-8 left-8 size-32 rounded-full bg-amber-500/10 blur-2xl" aria-hidden />

						<div className="relative flex h-full flex-col">
							<span className="inline-flex items-center gap-2 self-start rounded-full border border-amber-500/35 bg-amber-500/12 px-3.5 py-1.5 text-xs font-semibold text-amber-200">
								<Gift className="size-3.5" />
								Старт без вложений
							</span>

							{/* Центрируем основной контент в свободном пространстве карточки */}
							<div className="flex flex-1 flex-col justify-center py-6">
								<div className="flex items-end gap-2">
									<span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-6xl font-bold tracking-tight text-transparent">
										+{PRICES.welcomeBonus} ₽
									</span>
									<span className="pb-2 text-sm text-stone-400">на баланс</span>
								</div>

								<p className="mt-3 text-sm leading-relaxed text-stone-300">
									Дарим {PRICES.welcomeBonus} ₽ при регистрации — этого хватает
									на первый полный AI-анализ. Попробуйте сервис, не доставая
									карту.
								</p>
							</div>

							<Link
								href="/login"
								className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-semibold text-stone-950 shadow-lg shadow-amber-500/25 transition hover:bg-amber-400"
							>
								<span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/20 transition-transform duration-700 group-hover:translate-x-[200%]" aria-hidden />
								Проверить идею бесплатно
								<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
							</Link>

							<p className="mt-3 text-center text-xs text-stone-400">
								Вход через Google или по ссылке из письма — без пароля
							</p>
						</div>
					</Reveal>

					{/* Прайс */}
					<Reveal
						delay={0.09}
						className="relative overflow-hidden rounded-3xl border border-stone-800/60 bg-stone-900/30 p-7"
					>
						<h3 className="text-xs font-semibold uppercase tracking-widest text-stone-500">
							Сколько что стоит
						</h3>
						<ul className="mt-5 divide-y divide-stone-800/60">
							{ACTIONS.map((action) => (
								<li
									key={action.label}
									className="flex items-center justify-between gap-4 py-3.5"
								>
									<div className="flex min-w-0 items-start gap-3">
										<Check
											className={`mt-0.5 size-4 shrink-0 ${
												action.free
													? "text-stone-500"
													: "text-emerald-400"
											}`}
										/>
										<div className="min-w-0">
											<p className="text-sm font-medium text-stone-100">
												{action.label}
											</p>
											<p className="text-xs text-stone-400">
												{action.hint}
											</p>
										</div>
									</div>
									<span
										className={`shrink-0 text-sm font-semibold tabular-nums ${
											action.free ? "text-stone-400" : "text-stone-50"
										}`}
									>
										{action.price}
									</span>
								</li>
							))}
						</ul>
					</Reveal>
				</div>
			</div>
		</section>
	);
}
