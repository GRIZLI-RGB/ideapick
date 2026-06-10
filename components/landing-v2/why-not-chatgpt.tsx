import { Reveal } from "@/components/landing-v2/reveal";
import { SectionHeading } from "@/components/landing-v2/section-heading";
import { PRICES } from "@/lib/ideas/constants";
import { Bot, Check, Minus, Sparkles } from "lucide-react";

const CHATGPT_POINTS = [
	"Структура ответа каждый раз разная",
	"Вежливо хвалит почти любую идею",
	"Нет оценки и вердикта — только рассуждения",
	"Качество зависит от вашего промпта",
];

const IDEAPICK_POINTS = [
	"Всегда один формат: отчёт из 6 разделов",
	"Честный вердикт, даже если идея слабая",
	"Оценка 0–100 и план первых шагов",
	"Промпт не нужен — хватит пары предложений",
];

export function WhyNotChatGpt() {
	return (
		<section className="relative scroll-mt-20 px-5 py-16 sm:px-6">
			<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-700/40 to-transparent" aria-hidden />
			{/* Локальное свечение секции */}
			<div className="pointer-events-none absolute -left-24 top-1/3 -z-10 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgb(245_158_11/0.045)_0%,transparent_70%)]" aria-hidden />

			<div className="mx-auto max-w-6xl">
				<SectionHeading
					eyebrow="Почему не просто ChatGPT"
					title="Чат-бот даст мнение. Ideapick — вердикт"
					description="Спросить нейросеть можно бесплатно — но вы получите вежливый текст без структуры и оценки. Здесь — стандартизированный отчёт, по которому можно принять решение."
				/>

				<div className="mt-12 grid gap-4 md:grid-cols-2">
					{/* Вопрос в ChatGPT */}
					<Reveal className="flex h-full flex-col rounded-3xl border border-stone-800/60 bg-stone-900/30 p-7">
						<div className="flex items-center gap-3">
							<span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-stone-700/60 bg-stone-800/60 text-stone-300">
								<Bot className="size-5" />
							</span>
							<h3 className="text-base font-semibold tracking-tight text-stone-200">
								Вопрос в ChatGPT
							</h3>
						</div>
						<ul className="mt-6 space-y-3.5">
							{CHATGPT_POINTS.map((point) => (
								<li
									key={point}
									className="flex items-start gap-3 text-sm leading-relaxed text-stone-400"
								>
									<Minus className="mt-0.5 size-4 shrink-0 text-stone-600" />
									{point}
								</li>
							))}
						</ul>
					</Reveal>

					{/* Анализ в Ideapick */}
					<Reveal
						delay={0.09}
						className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-amber-500/30 p-7"
					>
						<div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/8 via-stone-900/50 to-stone-950/70" aria-hidden />
						<div className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-amber-500/15 blur-3xl" aria-hidden />

						<div className="relative">
							<div className="flex items-center gap-3">
								<span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-amber-500/25 bg-amber-500/10 text-amber-300">
									<Sparkles className="size-5" />
								</span>
								<h3 className="text-base font-semibold tracking-tight text-stone-50">
									Анализ в Ideapick
								</h3>
							</div>
							<ul className="mt-6 space-y-3.5">
								{IDEAPICK_POINTS.map((point) => (
									<li
										key={point}
										className="flex items-start gap-3 text-sm leading-relaxed text-stone-200"
									>
										<Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
										{point}
									</li>
								))}
							</ul>
						</div>
					</Reveal>
				</div>
			</div>
		</section>
	);
}
