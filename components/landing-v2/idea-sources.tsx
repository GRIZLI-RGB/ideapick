import { Reveal } from "@/components/landing-v2/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { PRICES, RANDOM_DAILY_LIMIT } from "@/lib/ideas/constants";
import { Dices, Fingerprint, PenLine } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Source = {
	icon: LucideIcon;
	title: string;
	price: string;
	free: boolean;
	text: string;
	note?: string;
	accent: string;
	iconClass: string;
	priceClass: string;
};

const SOURCES: Source[] = [
	{
		icon: PenLine,
		title: "Своя идея",
		price: "Бесплатно",
		free: true,
		text: "Уже есть задумка? Запишите название и описание — и сразу отправляйте на анализ. Это всё, что нужно.",
		accent: "border-stone-700/70 hover:border-stone-600/80",
		iconClass: "border-stone-700/60 bg-stone-800/60 text-stone-200",
		priceClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
	},
	{
		icon: Dices,
		title: "Из каталога",
		price: "Бесплатно",
		free: true,
		text: "Не знаете, за что взяться? Возьмите готовую идею из каталога — мгновенно. Идеи не повторяются: каждый раз новая.",
		note: `до ${RANDOM_DAILY_LIMIT} раз в сутки`,
		accent: "border-amber-500/30 hover:border-amber-500/50",
		iconClass: "border-amber-500/25 bg-amber-500/10 text-amber-300",
		priceClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
	},
	{
		icon: Fingerprint,
		title: "Под ваш профиль",
		price: `${PRICES.anamnesis} ₽`,
		free: false,
		text: "AI задаст несколько вопросов о вашем опыте и интересах — и предложит идеи, которые подходят именно вам.",
		accent: "border-violet-500/25 hover:border-violet-500/40",
		iconClass: "border-violet-500/25 bg-violet-500/10 text-violet-300",
		priceClass: "border-violet-500/30 bg-violet-500/10 text-violet-300",
	},
];

export function IdeaSources() {
	return (
		<section className="relative scroll-mt-20 px-5 py-16 sm:px-6">
			<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-700/40 to-transparent" aria-hidden />
			{/* Локальное свечение секции */}
			<div className="pointer-events-none absolute -right-32 top-1/3 -z-10 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgb(168_85_247/0.05)_0%,transparent_70%)]" aria-hidden />

			<div className="mx-auto max-w-6xl">
				<SectionHeading
					eyebrow="Откуда брать идеи"
					title="Идея найдётся, даже если её пока нет"
					description="Три способа начать — от собственной задумки до подборки, сгенерированной под ваш опыт."
				/>

				<div className="mt-12 grid gap-4 md:grid-cols-3">
					{SOURCES.map((s, i) => {
						const Icon = s.icon;
						return (
							<Reveal
								key={s.title}
								delay={i * 0.08}
								className={`group flex h-full flex-col rounded-3xl border bg-stone-900/30 p-6 transition duration-300 hover:bg-stone-900/55 ${s.accent}`}
							>
								<div className="flex items-start justify-between gap-2">
									<span
										className={`flex size-12 shrink-0 items-center justify-center rounded-2xl border transition-colors duration-300 ${s.iconClass}`}
									>
										<Icon className="size-5" />
									</span>
									<span
										className={`mt-1 rounded-full border px-2.5 py-1 text-xs font-semibold tabular-nums ${s.priceClass}`}
									>
										{s.price}
									</span>
								</div>

								<h3 className="mt-5 text-base font-semibold tracking-tight text-stone-50">
									{s.title}
								</h3>
								<p className="mt-2 flex-1 text-sm leading-relaxed text-stone-400">
									{s.text}
								</p>
								{s.note ? (
									<p className="mt-3 text-xs font-medium text-stone-500">
										{s.note}
									</p>
								) : null}
							</Reveal>
						);
					})}
				</div>
			</div>
		</section>
	);
}
