"use client";

import { useId, useState } from "react";
import { Reveal } from "@/components/landing-v2/reveal";
import { SectionHeading } from "@/components/landing-v2/section-heading";
import { LANDING_FAQ_ITEMS } from "@/lib/landing/faq-items";
import { ChevronDown, Mail } from "lucide-react";

const SUPPORT_EMAIL = "support@ideapick.ru";

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
	const [open, setOpen] = useState(false);
	const panelId = useId();
	return (
		<Reveal
			delay={index * 0.04}
			className={`overflow-hidden rounded-2xl border transition duration-200 ${
				open
					? "border-amber-500/25 bg-stone-900/55"
					: "border-stone-800/60 bg-stone-900/30 hover:border-stone-700/70"
			}`}
		>
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left"
				aria-expanded={open}
				aria-controls={panelId}
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
				id={panelId}
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
	// Две независимые колонки: открытие вопроса не двигает соседнюю колонку
	const mid = Math.ceil(LANDING_FAQ_ITEMS.length / 2);
	const columns = [
		LANDING_FAQ_ITEMS.slice(0, mid),
		LANDING_FAQ_ITEMS.slice(mid),
	];

	return (
		<section
			id="faq"
			className="relative scroll-mt-20 px-5 py-20 sm:px-6 lg:py-28"
		>
			<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-700/40 to-transparent" aria-hidden />
			{/* Локальное свечение секции */}
			<div className="pointer-events-none absolute -right-32 top-1/3 -z-10 h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgb(245_158_11/0.04)_0%,transparent_70%)]" aria-hidden />
			<div className="mx-auto max-w-5xl">
				<SectionHeading
					eyebrow="Частые вопросы"
					title="Коротко о главном"
					description="Что такое Ideapick, как он считает оценку и сколько это стоит — без походов в поддержку."
				/>
				<div className="mt-10 grid items-start gap-3 lg:grid-cols-2">
					{columns.map((items, col) => (
						<div key={col} className="space-y-3">
							{items.map((item, i) => (
								<FaqItem
									key={item.q}
									q={item.q}
									a={item.a}
									index={col * mid + i}
								/>
							))}
						</div>
					))}
				</div>

				{/* Плашка поддержки */}
				<Reveal delay={0.1} className="mt-8">
					<div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-stone-800/60 bg-stone-900/30 px-5 py-4 sm:flex-row">
						<p className="text-sm text-stone-400">
							Не нашли ответ? Напишите нам — отвечаем быстро.
						</p>
						<a
							href={`mailto:${SUPPORT_EMAIL}`}
							className="inline-flex items-center gap-2 rounded-xl border border-stone-700/70 bg-stone-900/60 px-3.5 py-2 text-sm font-medium text-stone-200 transition hover:border-stone-600 hover:text-stone-50"
						>
							<Mail className="size-4 text-amber-400/80" />
							{SUPPORT_EMAIL}
						</a>
					</div>
				</Reveal>
			</div>
		</section>
	);
}
