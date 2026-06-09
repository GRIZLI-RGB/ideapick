import { ScoreRing } from "@/components/ideas/score-ring";
import {
	AlertTriangle,
	Coins,
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
			{/* Свечение позади карточки */}
			<div
				className="pointer-events-none absolute -inset-8 -z-10 rounded-full bg-[radial-gradient(ellipse_at_50%_40%,rgb(245_158_11/0.22),transparent_65%)]"
				aria-hidden
			/>

			{/* Бонус-чип */}
			<div
				className="animate-fade-in absolute -right-3 -top-4 z-20 rounded-full border border-emerald-500/35 bg-emerald-950/85 px-3 py-1.5 text-xs font-semibold text-emerald-300 shadow-lg shadow-black/40 backdrop-blur-sm"
				style={{ animationDelay: "0.7s" }}
			>
				Первый анализ — бесплатно
			</div>

			{/* Карточка с CSS-левитацией */}
			<div className="animate-float overflow-hidden rounded-3xl border border-stone-700/60 bg-stone-900/80 p-6 shadow-2xl shadow-black/60 ring-1 ring-amber-500/10 backdrop-blur-sm">
				{/* Шапка */}
				<div className="flex items-center justify-between">
					<span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-300/90">
						<Sparkles className="size-3.5" />
						Отчёт AI-анализа
					</span>
					<span className="text-xs text-stone-500">сегодня</span>
				</div>

				{/* Score + название */}
				<div className="mt-4 flex items-start gap-4">
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
			</div>
		</div>
	);
}
