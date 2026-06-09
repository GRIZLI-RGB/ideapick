import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
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

const BANDS: Band[] = [
	{
		range:    "71–100",
		sample:   84,
		title:    "Сильная идея",
		text:     "Перспективна даже при типичных ограничениях соло-разработчика.",
		ring:     "stroke-emerald-400",
		ringText: "text-emerald-300",
		dot:      "bg-emerald-400",
		glow:     "bg-emerald-500/5",
		border:   "border-emerald-500/20 hover:border-emerald-500/35",
	},
	{
		range:    "51–70",
		sample:   62,
		title:    "Стоит проверять",
		text:     "Имеет смысл, но есть оговорки — нужна аккуратная проверка гипотез.",
		ring:     "stroke-amber-400",
		ringText: "text-amber-300",
		dot:      "bg-amber-400",
		glow:     "bg-amber-500/5",
		border:   "border-amber-500/20 hover:border-amber-500/35",
	},
	{
		range:    "31–50",
		sample:   42,
		title:    "Сомнительно",
		text:     "Потребуется сильная дифференциация, чтобы выделиться на рынке.",
		ring:     "stroke-sky-400",
		ringText: "text-sky-300",
		dot:      "bg-sky-400",
		glow:     "bg-sky-500/5",
		border:   "border-sky-500/20 hover:border-sky-500/35",
	},
	{
		range:    "0–30",
		sample:   22,
		title:    "Слабая идея",
		text:     "Низкий потенциал или высокие риски — вероятно, не стоит вложений.",
		ring:     "stroke-rose-400",
		ringText: "text-rose-300",
		dot:      "bg-rose-400",
		glow:     "bg-rose-500/5",
		border:   "border-rose-500/20 hover:border-rose-500/35",
	},
];

export function ScoreBands() {
	return (
		<section className="relative scroll-mt-20 px-5 py-16 sm:px-6">
			<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-700/40 to-transparent" aria-hidden />

			<div className="mx-auto max-w-6xl">
				<SectionHeading
					eyebrow="Одна понятная оценка"
					title="Score 0–100, который сразу говорит о главном"
					description="Все факторы сводятся в один рейтинг с цветовой подсказкой — вы понимаете расклад за секунду."
				/>

				{/* Цветовая шкала */}
				<Reveal delay={0.05} className="mt-10">
					<div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gradient-to-r from-rose-500 via-sky-500 via-40% to-emerald-500">
						<div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
					</div>
					<div className="mt-2 flex justify-between text-[11px] text-stone-600">
						<span>0</span>
						<span>50</span>
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
								className={`pointer-events-none absolute -right-6 -top-6 size-24 rounded-full opacity-60 blur-2xl ${band.dot.replace("bg-", "bg-")}`}
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
