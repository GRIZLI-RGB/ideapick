"use client";

import { useState } from "react";
import { Reveal } from "@/components/landing-v2/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { ChevronDown } from "lucide-react";

const FAQ: { q: string; a: string }[] = [
	{
		q: "Что именно делает IdeaPick?",
		a: "Вы описываете идею названием и парой предложений, а AI оценивает её по спросу, конкуренции, монетизации, реализуемости и рискам, сводя всё к рейтингу 0–100 с понятным отчётом и первыми шагами.",
	},
	{
		q: "Кто видит мои идеи?",
		a: "Только вы. Идеи хранятся в вашем аккаунте, не публикуются и не попадают в общий каталог. Каталог готовых идей — отдельная подборка, никак не связанная с идеями пользователей.",
	},
	{
		q: "Насколько можно доверять оценке?",
		a: "Это обоснованная рекомендация AI, а не инвестиционный совет и не гарантия. Она помогает рассуждать рационально и не пропустить важные факторы, но финальное решение всегда за вами.",
	},
	{
		q: "Нужно ли вводить много данных?",
		a: "Нет. Принцип сервиса — минимум ввода, максимум выводов. Достаточно названия (от 5 символов) и описания (от 30 символов). Аудиторию, нишу и тип проекта AI выводит из текста сам.",
	},
	{
		q: "Сколько это стоит?",
		a: "Подписки нет. AI-анализ — 99 ₽, подборка идей под ваш профиль — 49 ₽, идея из каталога — бесплатно. При регистрации дарим 100 ₽ на баланс — их хватает на первый анализ.",
	},
	{
		q: "Как происходит оплата?",
		a: "Вы пополняете баланс в рублях от 100 ₽ через ЮKassa и получаете чек. Деньги списываются только за конкретное действие; при сбое анализа сумма возвращается на баланс.",
	},
	{
		q: "Как войти?",
		a: "Без паролей: через аккаунт Google или по ссылке из письма. Первый вход автоматически создаёт аккаунт и начисляет приветственные 100 ₽.",
	},
];

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
	const [open, setOpen] = useState(false);
	return (
		<Reveal
			delay={index * 0.05}
			className="overflow-hidden rounded-2xl border border-stone-800/60 bg-stone-900/30 transition duration-200 hover:border-stone-700/70"
		>
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left"
				aria-expanded={open}
			>
				<span className="text-sm font-medium text-stone-100 sm:text-base">
					{q}
				</span>
				<ChevronDown
					className={`size-5 shrink-0 text-stone-500 transition-transform duration-300 ${
						open ? "rotate-180 text-amber-400" : ""
					}`}
				/>
			</button>
			{/* grid-rows аккордеон: контент любой высоты не обрезается */}
			<div
				className="grid transition-[grid-template-rows,opacity] duration-300 ease-in-out"
				style={{
					gridTemplateRows: open ? "1fr" : "0fr",
					opacity: open ? 1 : 0,
				}}
			>
				<div className="overflow-hidden">
					<p className="px-5 pb-5 text-sm leading-relaxed text-stone-400">
						{a}
					</p>
				</div>
			</div>
		</Reveal>
	);
}

export function Faq() {
	return (
		<section
			id="faq"
			className="relative scroll-mt-20 px-5 py-20 sm:px-6 lg:py-28"
		>
			<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-700/40 to-transparent" aria-hidden />
			{/* Локальное свечение секции */}
			<div className="pointer-events-none absolute -right-32 top-1/3 -z-10 h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgb(245_158_11/0.04)_0%,transparent_70%)]" aria-hidden />
			<div className="mx-auto max-w-3xl">
				<SectionHeading eyebrow="Частые вопросы" title="Коротко о главном" />
				<div className="mt-10 space-y-3">
					{FAQ.map((item, i) => (
						<FaqItem key={item.q} q={item.q} a={item.a} index={i} />
					))}
				</div>
			</div>
		</section>
	);
}
