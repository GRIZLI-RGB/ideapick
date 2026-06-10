import Link from "next/link";
import { AnalysisPreview } from "@/components/landing-v2/analysis-preview";
import { PRICES } from "@/lib/ideas/constants";
import {
	ArrowRight,
	BarChart3,
	FileSearch,
	Sparkles,
	Wallet,
	Zap,
} from "lucide-react";

const STATS = [
	{ icon: Zap, label: "Вердикт за ~1 минуту" },
	{ icon: BarChart3, label: "6 факторов в одном отчёте" },
	{ icon: Wallet, label: `Без подписки — ${PRICES.analysis} ₽ за анализ` },
];

export function Hero() {
	return (
		<section className="relative px-5 pb-16 pt-32 sm:px-6 sm:pt-36 lg:pb-20 lg:pt-44">
			{/* Декоративные кольца за hero */}
			<div
				className="pointer-events-none absolute left-1/2 top-16 -z-10 -translate-x-1/2"
				aria-hidden
			>
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
						AI-оценка идей для соло-основателей
					</div>

					<h1
						className="animate-fade-up mt-5 text-balance text-3xl font-bold leading-[1.12] tracking-tight text-stone-50 sm:text-4xl lg:text-[2.7rem]"
						style={{ animationDelay: "0.07s" }}
					>
						<span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
							Стоит ли браться за идею?
						</span>{" "}
						<br className="hidden sm:block" />
						Узнайте это до того, как потратите на неё месяцы
					</h1>

					<p
						className="animate-fade-up mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-stone-400 sm:text-[1.0625rem] lg:mx-0"
						style={{ animationDelay: "0.14s" }}
					>
						Опишите идею в двух предложениях. AI оценит спрос,
						конкуренцию, монетизацию и реализуемость в одиночку —
						и даст вердикт 0–100 с планом первых шагов.
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
							Проверить идею бесплатно
							<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
						</Link>
						<a
							href="#example"
							className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-stone-700/80 bg-stone-900/50 px-6 py-3.5 text-sm font-semibold text-stone-200 transition hover:border-stone-600 hover:bg-stone-800/60 sm:w-auto"
						>
							<FileSearch className="size-4 text-stone-400" />
							Пример отчёта
						</a>
					</div>

					{/* Микрокопия под CTA: снимает конфликт «бесплатно vs 99 ₽» */}
					<p
						className="animate-fade-up mt-3 text-xs text-stone-500"
						style={{ animationDelay: "0.24s" }}
					>
						Без карты — бонус +{PRICES.welcomeBonus} ₽ при регистрации
						покрывает первый анализ
					</p>

					{/* Stats strip */}
					<div
						className="animate-fade-up mt-7 flex flex-col items-center gap-2.5 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4 lg:justify-start"
						style={{ animationDelay: "0.28s" }}
					>
						{STATS.map((s) => {
							const Icon = s.icon;
							return (
								<span
									key={s.label}
									className="inline-flex items-center gap-1.5 text-xs text-stone-400"
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
