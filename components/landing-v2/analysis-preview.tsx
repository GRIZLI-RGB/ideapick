import { ScoreRing } from "@/components/ideas/score-ring";
import { PRICES } from "@/lib/ideas/constants";
import {
	AlertTriangle,
	Coins,
	Gift,
	ListChecks,
	Sparkles,
	Swords,
	Users,
	Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Row = {
	icon: LucideIcon;
	label: string;
	verdict: string;
	tone: "good" | "mid" | "warn";
};

const ROWS: Row[] = [
	{ icon: Users,         label: "Спрос и аудитория", verdict: "Чёткая ниша",            tone: "good" },
	{ icon: Swords,        label: "Конкуренция",        verdict: "Низкая насыщенность",     tone: "good" },
	{ icon: Coins,         label: "Монетизация",        verdict: "Подписка для команд",     tone: "mid"  },
	{ icon: Wrench,        label: "Реализуемость",      verdict: "MVP за 3–4 недели",       tone: "good" },
	{ icon: AlertTriangle, label: "Риски",              verdict: "Зависимость от LLM-API",  tone: "warn" },
	{ icon: ListChecks,    label: "Первые шаги",        verdict: "3 гипотезы на проверку",  tone: "mid"  },
];

const TONE_CLASS: Record<Row["tone"], string> = {
	good: "text-emerald-300/90",
	mid:  "text-stone-300",
	warn: "text-amber-300/90",
};

/** Задержки для stagger-анимации строк */
const ROW_DELAYS = ["0.55s", "0.65s", "0.75s", "0.85s", "0.95s", "1.05s"];

export function AnalysisPreview() {
	return (
		<div
			className="animate-fade-in relative mx-auto w-full max-w-md"
			style={{ animationDelay: "0.2s" }}
		>
			{/* Мягкое широкое свечение позади карточки — без чёткой круглой формы */}
			<div
				className="pointer-events-none absolute -inset-x-16 -bottom-12 top-1/4 -z-10 bg-[radial-gradient(ellipse_at_50%_60%,rgb(245_158_11/0.1),transparent_70%)] blur-2xl"
				aria-hidden
			/>

			{/* Стопка отчётов: при наведении карточка приподнимается, слои расходятся вниз */}
			<div className="group relative">
				{/* Подложенные слои — «предыдущие отчёты» */}
				<div
					className="absolute inset-0 -z-10 translate-y-4 scale-[0.95] rounded-3xl border border-stone-700/60 bg-stone-900/70 transition-transform duration-500 ease-out group-hover:translate-y-5.5"
					aria-hidden
				/>
				<div
					className="absolute inset-0 -z-20 translate-y-8 scale-[0.89] rounded-3xl border border-stone-700/40 bg-stone-900/45 transition-transform duration-500 ease-out group-hover:translate-y-10.5"
					aria-hidden
				/>

				{/* Карточка отчёта */}
				<div className="overflow-hidden rounded-3xl border border-stone-700/60 bg-stone-900/85 shadow-2xl shadow-black/60 ring-1 ring-amber-500/10 backdrop-blur-sm transition-transform duration-500 ease-out group-hover:-translate-y-1">
					{/* Градиентная кромка сверху */}
					<div
						className="h-px bg-gradient-to-r from-transparent via-amber-400/45 to-transparent"
						aria-hidden
					/>

					<div className="p-6">
						{/* Шапка */}
						<div className="flex items-center justify-between">
							<span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-300/90">
								<Sparkles className="size-3.5" />
								Отчёт AI-анализа
							</span>
							<span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-400">
								<span className="relative flex size-1.5" aria-hidden>
									<span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/50 motion-reduce:animate-none" />
									<span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
								</span>
								Готово
							</span>
						</div>

						{/* Score + название */}
						<div className="mt-5 flex items-start gap-4">
							<ScoreRing
								score={84}
								size="lg"
								ringClassName="stroke-emerald-400"
								textClassName="text-emerald-300"
							/>
							<div className="min-w-0">
								<h3 className="text-base font-semibold leading-snug tracking-tight text-stone-50">
									Линтер промптов для VS Code
								</h3>
								<p className="mt-1 text-sm font-medium text-emerald-300/90">
									Сильная идея — можно браться
								</p>
							</div>
						</div>

						{/* Строки разделов с stagger */}
						<div className="mt-5 overflow-hidden rounded-2xl border border-stone-800/70 bg-stone-950/50">
							{ROWS.map((row, i) => {
								const Icon = row.icon;
								return (
									<div
										key={row.label}
										className="animate-row-in flex items-center justify-between gap-3 border-b border-stone-800/50 px-3.5 py-2.5 last:border-none"
										style={{ animationDelay: ROW_DELAYS[i] }}
									>
										<span className="flex min-w-0 items-center gap-2.5 text-sm text-stone-300">
											<Icon className="size-4 shrink-0 text-stone-500" />
											<span className="truncate">{row.label}</span>
										</span>
										<span className={`shrink-0 text-xs font-medium ${TONE_CLASS[row.tone]}`}>
											{row.verdict}
										</span>
									</div>
								);
							})}
						</div>

						{/* Футер — бонус как часть композиции */}
						<div className="mt-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-t border-stone-800/70 pt-4">
							<span className="flex items-center gap-2 whitespace-nowrap text-xs font-medium text-emerald-300">
								<Gift className="size-3.5 shrink-0" />
								Первый анализ — бесплатно
							</span>
							<span className="whitespace-nowrap text-xs font-semibold tabular-nums text-stone-400">
								+{PRICES.welcomeBonus} ₽ при регистрации
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
