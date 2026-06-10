import { Reveal } from "@/components/landing-v2/reveal";
import { SectionHeading } from "@/components/landing-v2/section-heading";
import { ScoreRing } from "@/components/ideas/score-ring";
import { REPORT_SECTIONS, type ReportSectionKey } from "@/lib/analysis/section-meta";
import { PRICES } from "@/lib/ideas/constants";
import { Sparkles } from "lucide-react";

type SampleSection = {
	text: string;
	chip: string;
	chipClass: string;
};

/** Содержимое примера отчёта — реалистичный разбор одной идеи */
const SAMPLE: Record<ReportSectionKey, SampleSection> = {
	demand: {
		text: "Команды, встраивающие LLM в продукты, регулярно ломают промпты при рефакторинге и не замечают этого до продакшена. Ниша узкая, но боль конкретная и растёт вместе с рынком.",
		chip: "Чёткая ниша",
		chipClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
	},
	competition: {
		text: "Прямых аналогов в маркетплейсе VS Code почти нет: ближайшие инструменты закрывают тестирование промптов, а не статический анализ в редакторе.",
		chip: "Низкая насыщенность",
		chipClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
	},
	monetization: {
		text: "Бесплатный линтер с базовыми правилами + платные командные пресеты. Платить готовы команды, а не одиночки — продавать стоит через тимлидов.",
		chip: "Подписка для команд",
		chipClass: "border-stone-600/60 bg-stone-800/60 text-stone-300",
	},
	execution: {
		text: "MVP на базе language server реально собрать одному за 3–4 недели. Основная сложность — поддержка форматов разных LLM-провайдеров.",
		chip: "MVP за 3–4 недели",
		chipClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
	},
	risks: {
		text: "Зависимость от форматов LLM-API: при их смене правила быстро устаревают. Закладывайте версионирование правил с первого дня.",
		chip: "Зависимость от API",
		chipClass: "border-amber-500/30 bg-amber-500/10 text-amber-300",
	},
	nextSteps: {
		text: "Опубликовать прототип с пятью базовыми правилами, собрать фидбек в трёх профильных комьюнити, проверить готовность платить интервью с десятью командами.",
		chip: "3 гипотезы на проверку",
		chipClass: "border-stone-600/60 bg-stone-800/60 text-stone-300",
	},
};

export function ExampleReport() {
	return (
		<section
			id="example"
			className="relative scroll-mt-20 px-5 py-20 sm:px-6 lg:py-28"
		>
			<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-700/40 to-transparent" aria-hidden />
			{/* Янтарный ореол за окном отчёта — центральная секция страницы */}
			<div className="animate-glow-breathe pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[620px] w-[920px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgb(245_158_11/0.09)_0%,transparent_65%)]" aria-hidden />

			<div className="mx-auto max-w-5xl">
				<SectionHeading
					eyebrow="Что внутри отчёта"
					title={`Вот что вы получаете за ${PRICES.analysis} ₽`}
					description="Не абстрактные обещания, а реальный формат результата: оценка, вердикт и шесть разделов по делу. Так выглядит готовый анализ."
				/>

				<Reveal delay={0.08} className="mt-12">
					{/* Окно-рамка в духе продукта */}
					<div className="relative overflow-hidden rounded-3xl border border-stone-700/60 bg-stone-900/60 shadow-2xl shadow-black/50 ring-1 ring-amber-500/10 backdrop-blur-sm">
						{/* Заголовок окна */}
						<div className="flex items-center justify-between border-b border-stone-800/70 bg-stone-950/50 px-5 py-3">
							<div className="flex items-center gap-1.5" aria-hidden>
								<span className="size-2.5 rounded-full bg-stone-700" />
								<span className="size-2.5 rounded-full bg-stone-700" />
								<span className="size-2.5 rounded-full bg-stone-700" />
							</div>
							<span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-300/90">
								<Sparkles className="size-3.5" />
								Отчёт AI-анализа · пример
							</span>
							<span className="hidden text-xs text-stone-600 sm:block">
								ideapick.ru
							</span>
						</div>

						<div className="p-5 sm:p-8">
							{/* Шапка отчёта */}
							<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
								<div className="flex items-center gap-4">
									<ScoreRing
										score={84}
										size="lg"
										ringClassName="stroke-emerald-400"
										textClassName="text-emerald-300"
									/>
									<div>
										<h3 className="text-lg font-semibold leading-snug tracking-tight text-stone-50">
											Линтер промптов для VS Code
										</h3>
										<p className="mt-0.5 text-sm text-stone-400">
											Расширение, которое проверяет промпты в коде на типичные
											ошибки — как ESLint, только для LLM.
										</p>
									</div>
								</div>
								<span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300">
									Сильная идея — можно браться
								</span>
							</div>

							{/* Разделы отчёта */}
							<div className="mt-7 grid gap-3 sm:grid-cols-2">
								{REPORT_SECTIONS.map((section) => {
									const Icon = section.icon;
									const sample = SAMPLE[section.key];
									return (
										<div
											key={section.key}
											className="flex flex-col rounded-2xl border border-stone-800/60 bg-stone-950/40 p-4.5 transition duration-300 hover:border-stone-700/70"
										>
											<div className="flex items-center justify-between gap-2">
												<span className="flex items-center gap-2 text-sm font-semibold text-stone-100">
													<Icon className="size-4 text-stone-500" />
													{section.label}
												</span>
												<span
													className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${sample.chipClass}`}
												>
													{sample.chip}
												</span>
											</div>
											<p className="mt-2.5 text-sm leading-relaxed text-stone-400">
												{sample.text}
											</p>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</Reveal>
			</div>
		</section>
	);
}
