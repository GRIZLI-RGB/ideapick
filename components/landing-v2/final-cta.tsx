import Link from "next/link";
import { Reveal } from "@/components/landing-v2/reveal";
import { PRICES } from "@/lib/ideas/constants";
import { ArrowRight, Gift } from "lucide-react";

export function FinalCta() {
	return (
		<section className="relative px-5 py-20 sm:px-6 lg:py-28">
			<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-700/40 to-transparent" aria-hidden />

			<Reveal className="mx-auto max-w-4xl">
				<div className="relative overflow-hidden rounded-[2.5rem] border border-amber-500/30 px-6 py-16 text-center sm:px-12 sm:py-20">
					{/* Фоновые слои */}
					<div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/10 via-stone-900/50 to-stone-950" aria-hidden />
					<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" aria-hidden />

					{/* Орбы */}
					<div className="pointer-events-none absolute -left-20 top-1/2 size-64 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl" aria-hidden />
					<div className="pointer-events-none absolute -right-20 top-1/2 size-64 -translate-y-1/2 rounded-full bg-amber-500/8 blur-3xl" aria-hidden />
					<div className="pointer-events-none absolute bottom-0 left-1/2 size-80 -translate-x-1/2 translate-y-1/2 rounded-full bg-amber-500/6 blur-3xl" aria-hidden />

					{/* Декоративные кольца */}
					<div className="pointer-events-none absolute left-1/2 top-1/2 size-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-500/[0.08]" aria-hidden />
					<div className="pointer-events-none absolute left-1/2 top-1/2 size-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-500/[0.06]" aria-hidden />

					{/* Контент */}
					<div className="relative">
						<span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-200">
							<Gift className="size-3.5" />
							+{PRICES.welcomeBonus} ₽ при регистрации
						</span>

						<h2 className="mt-5 text-balance text-3xl font-bold tracking-tight text-stone-50 sm:text-4xl lg:text-[2.6rem]">
							Проверьте идею за минуту —
							<br className="hidden sm:block" />
							<span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
								{" "}а не за месяцы разработки
							</span>
						</h2>

						<p className="mx-auto mt-4 max-w-lg text-pretty text-base leading-relaxed text-stone-400">
							Зарегистрируйтесь, получите {PRICES.welcomeBonus} ₽ на баланс
							и запустите первый AI-анализ без вложений.
						</p>

						<div className="mt-8 flex justify-center">
							<Link
								href="/login"
								className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-amber-500 px-8 py-4 text-sm font-semibold text-stone-950 shadow-xl shadow-amber-500/25 transition hover:bg-amber-400"
							>
								<span
									className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/20 transition-transform duration-700 group-hover:translate-x-[200%]"
									aria-hidden
								/>
								Проверить идею бесплатно
								<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
							</Link>
						</div>
					</div>
				</div>
			</Reveal>
		</section>
	);
}
