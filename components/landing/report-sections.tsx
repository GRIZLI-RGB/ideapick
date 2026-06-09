import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { REPORT_SECTIONS } from "@/lib/analysis/section-meta";

const SECTION_TEXT: Record<string, string> = {
	demand:       "Есть ли реальный спрос, кто целевая аудитория и насколько узкая ниша.",
	competition:  "Сколько похожих решений, насколько рынок насыщен и где барьеры входа.",
	monetization: "Как идея может зарабатывать и готова ли аудитория платить.",
	execution:    "Насколько реально собрать MVP силами одного человека и за какой срок.",
	risks:        "Главные угрозы: регуляторика, зависимости, слабые места гипотезы.",
	nextSteps:    "Конкретные первые шаги, чтобы дёшево проверить идею на практике.",
};

/** Цветовые акценты иконок — чередуются, чтобы сетка не была монотонной */
const ICON_COLORS = [
	"border-amber-500/25 bg-amber-500/10 text-amber-300",
	"border-sky-500/25   bg-sky-500/10   text-sky-300",
	"border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
	"border-violet-500/25  bg-violet-500/10  text-violet-300",
	"border-rose-500/25    bg-rose-500/10    text-rose-300",
	"border-cyan-500/25    bg-cyan-500/10    text-cyan-300",
];

const HOVER_BORDER = [
	"hover:border-amber-500/35",
	"hover:border-sky-500/35",
	"hover:border-emerald-500/35",
	"hover:border-violet-500/35",
	"hover:border-rose-500/35",
	"hover:border-cyan-500/35",
];

export function ReportSections() {
	return (
		<section
			id="report"
			className="relative scroll-mt-20 px-5 py-20 sm:px-6 lg:py-28"
		>
			<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-700/40 to-transparent" aria-hidden />

			<div className="mx-auto max-w-6xl">
				<SectionHeading
					eyebrow="Что внутри отчёта"
					title="Шесть разделов, которые отвечают на главные вопросы"
					description="Вместо абстрактного «нравится / не нравится» — структурированный разбор по факторам, которые определяют судьбу идеи."
				/>

				<div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{REPORT_SECTIONS.map((section, i) => {
						const Icon = section.icon;
						return (
							<Reveal
								key={section.key}
								delay={(i % 3) * 0.07}
								className={`group flex h-full flex-col rounded-3xl border border-stone-800/60 bg-stone-900/30 p-6 transition duration-300 hover:bg-stone-900/55 ${HOVER_BORDER[i]}`}
							>
								<div className="flex items-center gap-3">
									<span
										className={`flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300 ${ICON_COLORS[i]}`}
									>
										<Icon className="size-5" />
									</span>
									<h3 className="text-base font-semibold tracking-tight text-stone-50">
										{section.label}
									</h3>
								</div>
								<p className="mt-3 text-sm leading-relaxed text-stone-400">
									{SECTION_TEXT[section.key]}
								</p>
							</Reveal>
						);
					})}
				</div>

				<Reveal
					delay={0.1}
					className="mt-4 flex items-center justify-center rounded-2xl border border-stone-800/50 bg-stone-900/20 px-5 py-3.5 text-center text-xs text-stone-500"
				>
					Оценка — рекомендация AI, а не инвестиционный совет или гарантия
					результата.
				</Reveal>
			</div>
		</section>
	);
}
