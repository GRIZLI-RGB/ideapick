import Link from "next/link";
import { AnalysisPreview } from "@/components/landing/analysis-preview";
import { ArrowRight, Gift, Sparkles, Zap, Shield, Clock } from "lucide-react";

const STATS = [
	{ icon: Zap, label: "Анализ готов за ~1 минуту" },
	{ icon: Shield, label: "Оценка 6 факторов сразу" },
	{ icon: Clock, label: "Без подписки, только за результат" },
];

export function Hero() {
	return (
		<section className="relative px-5 pb-16 pt-28 sm:px-6 sm:pt-32 lg:pb-20 lg:pt-36">
			{/* Декоративные кольца за hero */}
			<div className="pointer-events-none absolute left-1/2 top-16 -z-10 -translate-x-1/2" aria-hidden>
				<div className="animate-spin-slow size-[580px] rounded-full border border-amber-500/[0.07]" />
				<div className="animate-spin-reverse absolute left-1/2 top-1/2 size-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-500/[0.05]" />
			</div>

			<div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
				{/* Левая колонка */}
				<div className="text-center lg:text-left">
					<div
						className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/8 px-4 py-1.5 text-xs font-medium text-amber-200/90"
						style={{ animationDelay: "0s" }}
					>
						<Sparkles className="size-3.5" />
						AI-оценка бизнес-идей · от идеи до вердикта
					</div>

					<h1
						className="animate-fade-up mt-5 text-balance text-4xl font-bold leading-[1.07] tracking-tight text-stone-50 sm:text-5xl lg:text-[3.25rem]"
						style={{ animationDelay: "0.07s" }}
					>
						Поймите, стоит ли{" "}
						<span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
							браться за идею
						</span>
						<br className="hidden lg:block" />
						{" "}— до того, как{" "}
						<br className="hidden sm:block lg:hidden" />
						вложите месяцы
					</h1>

					<p
						className="animate-fade-up mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-stone-400 sm:text-lg lg:mx-0"
						style={{ animationDelay: "0.14s" }}
					>
						Опишите идею в паре предложений — IdeaPick оценит спрос,
						конкуренцию, монетизацию и риски, выдаст честную оценку{" "}
						<span className="font-semibold text-stone-200">0–100</span> и
						понятный отчёт с первыми шагами.
					</p>

					{/* CTA кнопки */}
					<div
						className="animate-fade-up mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
						style={{ animationDelay: "0.21s" }}
					>
						<Link
							href="/login"
							className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-semibold text-stone-950 shadow-lg shadow-amber-500/25 transition hover:bg-amber-400 sm:w-auto"
						>
							{/* Shimmer overlay */}
							<span
								className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/20 transition-transform duration-700 group-hover:translate-x-[200%]"
								aria-hidden
							/>
							<Gift className="size-4" />
							Начать — +100 ₽ в подарок
							<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
						</Link>
						<a
							href="#how"
							className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-stone-700/80 bg-stone-900/50 px-6 py-3.5 text-sm font-semibold text-stone-200 transition hover:border-stone-600 hover:bg-stone-800/60 sm:w-auto"
						>
							Как это работает
						</a>
					</div>

					{/* Stats strip */}
					<div
						className="animate-fade-up mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-4 lg:justify-start"
						style={{ animationDelay: "0.28s" }}
					>
						{STATS.map((s) => {
							const Icon = s.icon;
							return (
								<span
									key={s.label}
									className="inline-flex items-center gap-1.5 text-xs text-stone-500"
								>
									<Icon className="size-3.5 text-amber-500/70" />
									{s.label}
								</span>
							);
						})}
					</div>
				</div>

				{/* Правая колонка — превью */}
				<div className="relative flex justify-center lg:justify-end">
					<AnalysisPreview />
				</div>
			</div>
		</section>
	);
}
