"use client";

import { QuickActionCard } from "@/components/ideas/add-idea-menu";
import { PRICES } from "@/lib/ideas/constants";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

const ACTIONS = [
	{
		mode: "create" as const,
		title: "Своя идея",
		description: "Опишите идею своими словами — название и пара предложений.",
		price: "0 ₽",
	},
	{
		mode: "random" as const,
		title: "Из каталога",
		description: "Случайная готовая идея — одна в день, достаётся только вам.",
		price: "0 ₽",
	},
	{
		mode: "anamnesis" as const,
		title: "По анамнезу",
		description: "Короткий опрос — AI предложит идею под ваш опыт и ресурсы.",
		price: `${PRICES.anamnesis} ₽`,
	},
];

export function EmptyState() {
	return (
		<motion.section
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			className="relative mx-auto max-w-3xl py-10 sm:py-14"
		>
			{/* мягкое янтарное свечение позади заголовка, как на лендинге */}
			<div
				className="pointer-events-none absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 rounded-full bg-amber-500/[0.07] blur-3xl"
				aria-hidden
			/>

			<header className="relative text-center">
				<div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-xl border border-stone-800 bg-stone-900 text-amber-400 shadow-lg shadow-black/30">
					<Lightbulb className="size-6" />
				</div>
				<h2 className="text-xl font-bold tracking-tight text-stone-50 sm:text-2xl">
					Начните с первой идеи
				</h2>
				<p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-400">
					Добавьте идею любым способом — и получите её разбор со
					скорингом, рисками и планом проверки.
				</p>
			</header>

			<div className="relative mt-8 grid gap-3 sm:grid-cols-3 sm:gap-4">
				{ACTIONS.map((action) => (
					<QuickActionCard
						key={action.mode}
						mode={action.mode}
						title={action.title}
						description={action.description}
						price={action.price}
					/>
				))}
			</div>
		</motion.section>
	);
}
