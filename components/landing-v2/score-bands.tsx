import { Reveal } from "@/components/landing-v2/reveal";
import { SectionHeading } from "@/components/landing-v2/section-heading";
import { ScoreRing } from "@/components/ideas/score-ring";

type Band = {
	range:    string;
	sample:   number;
	title:    string;
	text:     string;
	ring:     string;
	ringText: string;
	dot:      string;
	glow:     string;
	border:   string;
};

/** Зоны идут по возрастанию — в том же направлении, что и шкала выше */
const BANDS: Band[] = [
	{
		range:    "0–30",
		sample:   22,
		title:    "Слабая идея",
		text:     "Низкий потенциал или есть критичные риски. Скорее всего, не стоит вложений ресурсов.",
		ring:     "stroke-rose-400",
		ringText: "text-rose-300",
		dot:      "bg-rose-400",
		glow:     "bg-rose-500/5",
		border:   "border-rose-500/20 hover:border-rose-500/35",
	},
	{
		range:    "31–50",
		sample:   42,
		title:    "Сомнительно",
		text:     "Есть серьёзные слабые места — браться стоит только после доработки концепции идеи.",
		ring:     "stroke-orange-400",
		ringText: "text-orange-300",
		dot:      "bg-orange-400",
		glow:     "bg-orange-500/5",
		border:   "border-orange-500/20 hover:border-orange-500/35",
	},
	{
		range:    "51–70",
		sample:   62,
		title:    "Стоит проверять",
		text:     "Потенциал есть, но с оговорками. Стоит углубиться в идею и проверить ключевые гипотезы.",
		ring:     "stroke-amber-400",
		ringText: "text-amber-300",
		dot:      "bg-amber-400",
		glow:     "bg-amber-500/5",
		border:   "border-amber-500/20 hover:border-amber-500/35",
	},
	{
		range:    "71–100",
		sample:   84,
		title:    "Сильная идея",
		text:     "Перспективная идея. Можно браться и не бояться, что вы потратите своё время зря.",
		ring:     "stroke-emerald-400",
		ringText: "text-emerald-300",
		dot:      "bg-emerald-400",
		glow:     "bg-emerald-500/5",
		border:   "border-emerald-500/20 hover:border-emerald-500/35",
	},
];

export function ScoreBands() {
	return (
		<section className="relative scroll-mt-20 px-5 py-16 sm:px-6">
			<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-700/40 to-transparent" aria-hidden />
			{/* Локальное свечение секции */}
			<div className="pointer-events-none absolute -left-32 top-1/4 -z-10 h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgb(52_211_153/0.045)_0%,transparent_70%)]" aria-hidden />
			<div className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgb(244_63_94/0.04)_0%,transparent_70%)]" aria-hidden />

			<div className="mx-auto max-w-6xl">
				<SectionHeading
					eyebrow="Шкала оценки"
					title="Одна цифра, которая сразу говорит о главном"
					description="Все факторы сводятся в общий рейтинг 0–100 с цветовой индикацией."
				/>

				{/* Цветовая шкала — цвета и границы совпадают с зонами ниже */}
				<Reveal delay={0.05} className="mt-10">
					<div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[linear-gradient(90deg,var(--color-rose-500)_0%,var(--color-orange-400)_36%,var(--color-amber-400)_60%,var(--color-emerald-400)_88%)]">
						<div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
					</div>
					<div className="mt-2 flex justify-between text-[11px] text-stone-400">
						<span>0</span>
						<span>30</span>
						<span>50</span>
						<span>70</span>
						<span>100</span>
					</div>
				</Reveal>

				<div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{BANDS.map((band, i) => (
						<Reveal
							key={band.range}
							delay={i * 0.07}
							className={`relative flex h-full flex-col overflow-hidden rounded-3xl border p-6 transition duration-300 ${band.glow} ${band.border}`}
						>
							{/* Внутренний орб */}
							<div
								className={`pointer-events-none absolute -right-6 -top-6 size-24 rounded-full opacity-60 blur-2xl ${band.dot}`}
								aria-hidden
							/>
							<div className="flex items-center justify-between">
								<ScoreRing
									score={band.sample}
									size="md"
									ringClassName={band.ring}
									textClassName={band.ringText}
								/>
								<span className="flex items-center gap-1.5 text-xs font-semibold tabular-nums text-stone-400">
									<span className={`size-2 rounded-full ${band.dot}`} aria-hidden />
									{band.range}
								</span>
							</div>
							<h3 className="mt-4 text-sm font-semibold tracking-tight text-stone-50">
								{band.title}
							</h3>
							<p className="mt-1.5 text-sm leading-relaxed text-stone-400">
								{band.text}
							</p>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}
