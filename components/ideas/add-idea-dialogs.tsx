"use client";

import { useIdeasDemo } from "@/components/ideas/ideas-demo-provider";
import { PRICES, RANDOM_DAILY_LIMIT } from "@/lib/ideas/constants";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { useState } from "react";

const ANAMNESIS_STEPS = [
	{
		question: "Какой у вас основной навык?",
		options: ["Разработка", "Дизайн", "Маркетинг", "Другое"],
	},
	{
		question: "Сколько времени готовы уделять в неделю?",
		options: ["До 5 ч", "5–15 ч", "15+ ч"],
	},
	{
		question: "Предпочитаемая модель?",
		options: ["SaaS / подписка", "Разовая оплата", "Не важно"],
	},
];

function DialogShell({
	title,
	onClose,
	children,
}: {
	title: string;
	onClose: () => void;
	children: React.ReactNode;
}) {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
			onClick={onClose}
		>
			<motion.div
				initial={{ opacity: 0, y: 24 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: 16 }}
				transition={{ type: "spring", damping: 28, stiffness: 320 }}
				className="w-full max-w-md overflow-hidden rounded-2xl border border-stone-700/80 bg-stone-900 shadow-2xl shadow-black/60 ring-1 ring-white/5"
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-labelledby="dialog-title"
			>
				<div className="flex items-center justify-between border-b border-stone-800 px-5 py-4">
					<h2 id="dialog-title" className="text-base font-semibold text-stone-100">
						{title}
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="cursor-pointer rounded-lg p-1.5 text-stone-500 transition hover:bg-stone-800 hover:text-stone-300"
						aria-label="Закрыть"
					>
						<X className="size-4" />
					</button>
				</div>
				<div className="p-5">{children}</div>
			</motion.div>
		</motion.div>
	);
}

function CreateDialog({ onClose }: { onClose: () => void }) {
	const { createIdea } = useIdeasDemo();
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [saving, setSaving] = useState(false);

	return (
		<DialogShell title="Своя идея" onClose={onClose}>
			<form
				className="space-y-4"
				onSubmit={async (e) => {
					e.preventDefault();
					if (!title.trim() || saving) return;
					setSaving(true);
					const ok = await createIdea(title, description);
					if (!ok) setSaving(false);
				}}
			>
				<div>
					<label className="text-xs font-medium uppercase tracking-wider text-stone-500">
						Название
					</label>
					<input
						value={title}
						onChange={(e) => setTitle(e.target.value.slice(0, 100))}
						maxLength={100}
						placeholder="Например: SaaS для учёта подписок"
						className="mt-1.5 w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2.5 text-sm text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
						autoFocus
					/>
				</div>
				<div>
					<label className="text-xs font-medium uppercase tracking-wider text-stone-500">
						Описание
					</label>
					<textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						rows={4}
						placeholder="Кому помогает, как зарабатывает, чем отличается…"
						className="mt-1.5 w-full resize-none rounded-xl border border-stone-700 bg-stone-950 px-3 py-2.5 text-sm text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
					/>
				</div>
				<button
					type="submit"
					disabled={!title.trim() || saving}
					className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{saving ? <Loader2 className="size-4 animate-spin" /> : null}
					Добавить · 0 ₽
				</button>
			</form>
		</DialogShell>
	);
}

function RandomDialog({ onClose }: { onClose: () => void }) {
	const { addRandomIdea, randomUsedToday, randomLimit } = useIdeasDemo();
	const [loading, setLoading] = useState(false);
	const left = randomLimit - randomUsedToday;

	return (
		<DialogShell title="Идея из каталога" onClose={onClose}>
			<p className="text-sm leading-relaxed text-stone-400">
				Случайная идея из нашего каталога — без AI, бесплатно. Каждая идея
				выдаётся один раз.
			</p>
			<p className="mt-2 text-xs text-stone-500">
				Осталось сегодня: {Math.max(0, left)} из {RANDOM_DAILY_LIMIT}
			</p>
			<button
				type="button"
				disabled={left <= 0 || loading}
				onClick={async () => {
					setLoading(true);
					const ok = await addRandomIdea();
					if (!ok) setLoading(false);
				}}
				className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{loading ? <Loader2 className="size-4 animate-spin" /> : null}
				{left <= 0 ? "Лимит на сегодня исчерпан" : "Получить идею · 0 ₽"}
			</button>
		</DialogShell>
	);
}

function AnamnesisDialog({ onClose }: { onClose: () => void }) {
	const { addAnamnesisIdeas, balance } = useIdeasDemo();
	const [step, setStep] = useState(0);
	const [answers, setAnswers] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const current = ANAMNESIS_STEPS[step];
	const isConfirm = step >= ANAMNESIS_STEPS.length;
	const canPay = balance >= PRICES.anamnesis;

	if (isConfirm) {
		return (
			<DialogShell title="Генерация по анамнезу" onClose={onClose}>
				<p className="text-sm text-stone-400">
					AI сгенерирует идею на основе ваших ответов. Списание с баланса после
					подтверждения.
				</p>
				<ul className="mt-3 space-y-1.5 text-xs text-stone-500">
					{answers.map((a, i) => (
						<li key={i}>
							{ANAMNESIS_STEPS[i].question}{" "}
							<span className="text-stone-400">→ {a}</span>
						</li>
					))}
				</ul>
				<button
					type="button"
					disabled={!canPay || loading}
					onClick={async () => {
						setLoading(true);
						const ok = await addAnamnesisIdeas();
						if (!ok) setLoading(false);
					}}
					className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{loading ? <Loader2 className="size-4 animate-spin" /> : null}
					{canPay
						? `Сгенерировать · ${PRICES.anamnesis} ₽`
						: "Недостаточно средств"}
				</button>
			</DialogShell>
		);
	}

	return (
		<DialogShell title="Анамнез" onClose={onClose}>
			<p className="mb-1 text-xs font-medium text-amber-500/90">
				Шаг {step + 1} из {ANAMNESIS_STEPS.length}
			</p>
			<p className="text-sm font-medium text-stone-200">{current.question}</p>
			<div className="mt-4 space-y-2">
				{current.options.map((opt) => (
					<button
						key={opt}
						type="button"
						onClick={() => {
							const next = [...answers, opt];
							setAnswers(next);
							setStep((s) => s + 1);
						}}
						className="w-full cursor-pointer rounded-xl border border-stone-700 bg-stone-950 px-4 py-2.5 text-left text-sm text-stone-300 transition hover:border-amber-500/40 hover:bg-stone-800/80"
					>
						{opt}
					</button>
				))}
			</div>
		</DialogShell>
	);
}

export function AddIdeaDialogs() {
	const { activeDialog, closeDialog } = useIdeasDemo();

	return (
		<AnimatePresence>
			{activeDialog === "create" ? (
				<CreateDialog key="create" onClose={closeDialog} />
			) : null}
			{activeDialog === "random" ? (
				<RandomDialog key="random" onClose={closeDialog} />
			) : null}
			{activeDialog === "anamnesis" ? (
				<AnamnesisDialog key="anamnesis" onClose={closeDialog} />
			) : null}
		</AnimatePresence>
	);
}

export function DemoToast() {
	const { toast, clearToast } = useIdeasDemo();

	return (
		<AnimatePresence>
			{toast ? (
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 8 }}
					className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-stone-700 bg-stone-900 px-4 py-2.5 text-sm text-stone-200 shadow-xl shadow-black/40"
					onAnimationComplete={() => {
						setTimeout(clearToast, 2800);
					}}
				>
					{toast}
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
