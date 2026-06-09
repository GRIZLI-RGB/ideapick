import { Reveal } from "@/components/landing-v2/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { FileText, ScanSearch, Gauge, Rocket } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Step = {
	icon: LucideIcon;
	step: string;
	title: string;
	text: string;
	color: string;
	iconBg: string;
};

const STEPS: Step[] = [
	{
		icon: FileText,
		step: "01",
		title: "Опишите идею",
		text: "Название и пара предложений. Никаких анкет про аудиторию и нишу — AI выведет это из текста сам.",
		color: "border-amber-500/30 hover:border-amber-500/50",
		iconBg: "border-amber-500/25 bg-amber-500/10 text-amber-300",
	},
	{
		icon: ScanSearch,
		step: "02",
		title: "Запустите анализ",
		text: "AI разберёт рынок, конкурентов, монетизацию и реализуемость силами одного человека. Около минуты.",
		color: "border-sky-500/25 hover:border-sky-500/40",
		iconBg: "border-sky-500/25 bg-sky-500/10 text-sky-300",
	},
	{
		icon: Gauge,
		step: "03",
		title: "Получите вердикт",
		text: "Одна оценка 0–100 и отчёт из шести разделов. Без воды и простыней текста.",
		color: "border-emerald-500/25 hover:border-emerald-500/40",
		iconBg: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
	},
	{
		icon: Rocket,
		step: "04",
		title: "Решайте обоснованно",
		text: "Браться, доработать формулировку или отложить. Меньше догадок — больше сэкономленных месяцев.",
		color: "border-violet-500/25 hover:border-violet-500/40",
		iconBg: "border-violet-500/25 bg-violet-500/10 text-violet-300",
	},
];

export function HowItWorks() {
	return (
		<section id="how" className="relative scroll-mt-20 px-5 py-20 sm:px-6 lg:py-28">
			<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-700/40 to-transparent" aria-hidden />
			{/* Локальное свечение секции */}
			<div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[380px] w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgb(245_158_11/0.05)_0%,transparent_65%)]" aria-hidden />
			<div className="pointer-events-none absolute -left-32 bottom-0 -z-10 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgb(56_189_248/0.045)_0%,transparent_70%)]" aria-hidden />

			<div className="mx-auto max-w-6xl">
				<SectionHeading
					eyebrow="Как это работает"
					title="От сырой идеи до решения — четыре шага"
					description="Минимум ввода с вашей стороны — максимум обоснованных выводов от системы."
				/>

				<div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{STEPS.map((step, i) => {
						const Icon = step.icon;
						return (
							<Reveal
								key={step.step}
								delay={i * 0.07}
								className={`group relative flex h-full flex-col rounded-3xl border bg-stone-900/30 p-6 transition duration-300 hover:bg-stone-900/60 ${step.color}`}
							>
								<div className="flex items-center justify-between">
									<span
										className={`flex size-11 items-center justify-center rounded-2xl border transition-colors duration-300 ${step.iconBg}`}
									>
										<Icon className="size-5" />
									</span>
									<span className="font-mono text-3xl font-bold tabular-nums text-stone-800/60 transition-colors duration-300 group-hover:text-stone-700/80">
										{step.step}
									</span>
								</div>

								<h3 className="mt-5 text-base font-semibold tracking-tight text-stone-50">
									{step.title}
								</h3>
								<p className="mt-2 flex-1 text-sm leading-relaxed text-stone-400">
									{step.text}
								</p>

								{/* Коннектор → только на десктопе */}
								{i < STEPS.length - 1 && (
									<div
										className="pointer-events-none absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 lg:block"
										aria-hidden
									>
										<svg
											width="24"
											height="16"
											viewBox="0 0 24 16"
											fill="none"
											className="text-stone-700"
										>
											<path
												d="M0 8h20M14 2l6 6-6 6"
												stroke="currentColor"
												strokeWidth="1.5"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									</div>
								)}
							</Reveal>
						);
					})}
				</div>
			</div>
		</section>
	);
}
