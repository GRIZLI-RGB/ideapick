"use client";

import {
	TOAST_DURATION_MS,
	useIdeasDemo,
	type ToastKind,
} from "@/components/ideas/ideas-demo-provider";
import { PRICES } from "@/lib/ideas/constants";
import {
	getFillLevel,
	IDEA_DESCRIPTION_GOOD,
	IDEA_DESCRIPTION_MAX,
	IDEA_DESCRIPTION_MIN,
	IDEA_TITLE_GOOD,
	IDEA_TITLE_MAX,
	IDEA_TITLE_MIN,
	type FillLevel,
} from "@/lib/ideas/validation";
import { AnimatePresence, motion } from "framer-motion";
import {
	AlertCircle,
	Briefcase,
	Building2,
	CalendarClock,
	CheckCircle2,
	ChevronDown,
	Dices,
	Fingerprint,
	Gift,
	Globe,
	GraduationCap,
	Info,
	Loader2,
	PackageOpen,
	Smartphone,
	Sparkles,
	Store,
	X,
	Zap,
	type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

// ---------------------------------------------------------------------------
// Трёхсегментный индикатор заполнения поля
// ---------------------------------------------------------------------------

const METER_R = 15;
const METER_C = 2 * Math.PI * METER_R;
const METER_GAP = 7;
const METER_SEG = METER_C / 3 - METER_GAP;
const METER_HALF_GAP_DEG = (METER_GAP / 2 / METER_C) * 360;

const FILL_LABEL: Record<FillLevel, string> = {
	0: "Поле не заполнено",
	1: "Слишком коротко",
	2: "Заполнено достаточно",
	3: "Заполнено отлично",
};

const FILL_STROKE: Record<FillLevel, string> = {
	0: "stroke-stone-700",
	1: "stroke-red-400",
	2: "stroke-amber-400",
	3: "stroke-emerald-400",
};

function FillMeter({ level }: { level: FillLevel }) {
	return (
		<span
			role="img"
			aria-label={FILL_LABEL[level]}
			title={FILL_LABEL[level]}
		>
			<svg viewBox="0 0 36 36" className="size-3.5">
				{[0, 1, 2].map((i) => (
					<circle
						key={i}
						cx={18}
						cy={18}
						r={METER_R}
						fill="none"
						strokeWidth={3.5}
						strokeLinecap="round"
						strokeDasharray={`${METER_SEG} ${METER_C - METER_SEG}`}
						transform={`rotate(${-90 + i * 120 + METER_HALF_GAP_DEG} 18 18)`}
						className={`transition-colors duration-300 ${
							i < level ? FILL_STROKE[level] : "stroke-stone-700"
						}`}
					/>
				))}
			</svg>
		</span>
	);
}

function CharCounter({ length, max }: { length: number; max: number }) {
	const tone =
		length >= max
			? "text-red-400"
			: length >= max * 0.9
				? "text-amber-400"
				: "text-stone-600";
	return (
		<span className={`text-[11px] tabular-nums transition-colors ${tone}`}>
			{length}/{max}
		</span>
	);
}

// ---------------------------------------------------------------------------
// Шаблоны описания (docs/backlog.md, п. 2)
// ---------------------------------------------------------------------------

type DescriptionTemplate = {
	id: string;
	label: string;
	icon: LucideIcon;
	text: string;
};

const DESCRIPTION_TEMPLATES: DescriptionTemplate[] = [
	{
		id: "website",
		label: "Веб-сайт",
		icon: Globe,
		text: "Проблема: …\nЧто за сайт и как решает: …\nКто платит и за что: …\nКанал привлечения: …",
	},
	{
		id: "marketplace",
		label: "Маркетплейс",
		icon: Store,
		text: "Проблема: …\nКого соединяет площадка: …\nМонетизация: …\nКак привлечь обе стороны: …",
	},
	{
		id: "mobile",
		label: "Мобильное приложение",
		icon: Smartphone,
		text: "Проблема: …\nРешение (приложение): …\nМонетизация: …\nКанал привлечения: …",
	},
	{
		id: "course",
		label: "Курс / инфопродукт",
		icon: GraduationCap,
		text: "Чему учит и какой результат: …\nДля кого: …\nФормат и цена: …\nГде искать учеников: …",
	},
	{
		id: "physical",
		label: "Физический бизнес",
		icon: Building2,
		text: "Что за бизнес и какую потребность закрывает: …\nДля кого: …\nЗатраты на запуск и цены: …\nКак привлекать клиентов: …",
	},
	{
		id: "service",
		label: "Услуга / агентство",
		icon: Briefcase,
		text: "Какая услуга: …\nДля кого и какая боль: …\nЦенообразование: …\nКак находим клиентов: …",
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
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			window.removeEventListener("keydown", onKey);
			document.body.style.overflow = prevOverflow;
		};
	}, [onClose]);

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
				className="flex max-h-[min(90vh,680px)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-stone-700/80 bg-stone-900 shadow-2xl shadow-black/60 ring-1 ring-white/5"
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-labelledby="dialog-title"
			>
				<div className="flex shrink-0 items-center justify-between border-b border-stone-800 px-5 py-4">
					<h2
						id="dialog-title"
						className="text-base font-semibold text-stone-100"
					>
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
				<div className="overflow-y-auto p-5">{children}</div>
			</motion.div>
		</motion.div>
	);
}

function CreateDialog({ onClose }: { onClose: () => void }) {
	const { createIdea } = useIdeasDemo();
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [saving, setSaving] = useState(false);
	const [templatesOpen, setTemplatesOpen] = useState(false);
	const [confirmTemplate, setConfirmTemplate] = useState<string | null>(null);
	const descriptionRef = useRef<HTMLTextAreaElement>(null);
	const confirmTimer = useRef<number | undefined>(undefined);

	useEffect(() => () => window.clearTimeout(confirmTimer.current), []);

	const titleLen = title.trim().length;
	const descLen = description.trim().length;
	const titleLevel = getFillLevel(titleLen, IDEA_TITLE_MIN, IDEA_TITLE_GOOD);
	const descLevel = getFillLevel(
		descLen,
		IDEA_DESCRIPTION_MIN,
		IDEA_DESCRIPTION_GOOD,
	);
	const canSubmit =
		titleLen >= IDEA_TITLE_MIN &&
		titleLen <= IDEA_TITLE_MAX &&
		descLen >= IDEA_DESCRIPTION_MIN &&
		descLen <= IDEA_DESCRIPTION_MAX;

	const applyTemplate = (template: DescriptionTemplate) => {
		const hasCustomText =
			descLen > 0 &&
			!DESCRIPTION_TEMPLATES.some((t) => t.text === description);
		// Чужой текст не затираем молча — просим подтвердить повторным кликом
		if (hasCustomText && confirmTemplate !== template.id) {
			setConfirmTemplate(template.id);
			window.clearTimeout(confirmTimer.current);
			confirmTimer.current = window.setTimeout(
				() => setConfirmTemplate(null),
				3000,
			);
			return;
		}
		window.clearTimeout(confirmTimer.current);
		setConfirmTemplate(null);
		setDescription(template.text);
		// Фокус на первое «…», чтобы ввод сразу заменял заглушку
		requestAnimationFrame(() => {
			const el = descriptionRef.current;
			if (!el) return;
			el.focus();
			const idx = template.text.indexOf("…");
			if (idx >= 0) el.setSelectionRange(idx, idx + 1);
		});
	};

	return (
		<DialogShell title="Своя идея" onClose={onClose}>
			<form
				className="space-y-4"
				onSubmit={async (e) => {
					e.preventDefault();
					if (!canSubmit || saving) return;
					setSaving(true);
					const ok = await createIdea(title, description);
					if (!ok) setSaving(false);
				}}
			>
				<div>
					<div className="flex items-center justify-between">
						<label
							htmlFor="idea-title"
							className="text-xs font-medium uppercase tracking-wider text-stone-500"
						>
							Название
						</label>
						<div className="flex items-center gap-2">
							<CharCounter
								length={title.length}
								max={IDEA_TITLE_MAX}
							/>
							<FillMeter level={titleLevel} />
						</div>
					</div>
					<input
						id="idea-title"
						value={title}
						onChange={(e) =>
							setTitle(e.target.value.slice(0, IDEA_TITLE_MAX))
						}
						maxLength={IDEA_TITLE_MAX}
						placeholder="Например: «SaaS для учёта подписок»"
						className="mt-1.5 w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2.5 text-sm text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
						autoFocus
					/>
					{titleLevel === 1 ? (
						<p className="mt-1.5 text-[11px] leading-snug text-red-400/90">
							Минимум {IDEA_TITLE_MIN} символа
						</p>
					) : null}
				</div>
				<div>
					<div className="flex items-center justify-between">
						<label
							htmlFor="idea-description"
							className="text-xs font-medium uppercase tracking-wider text-stone-500"
						>
							Описание
						</label>
						<div className="flex items-center gap-2">
							<CharCounter
								length={description.length}
								max={IDEA_DESCRIPTION_MAX}
							/>
							<FillMeter level={descLevel} />
						</div>
					</div>
					<textarea
						id="idea-description"
						ref={descriptionRef}
						value={description}
						onChange={(e) =>
							setDescription(
								e.target.value.slice(0, IDEA_DESCRIPTION_MAX),
							)
						}
						maxLength={IDEA_DESCRIPTION_MAX}
						rows={4}
						placeholder="Чем подробнее, тем лучше: какую проблему и как решает, формат проекта, особенности..."
						className="mt-1.5 w-full resize-none rounded-xl border border-stone-700 bg-stone-950 px-3 py-2.5 text-sm text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
					/>
					<button
						type="button"
						onClick={() => setTemplatesOpen((o) => !o)}
						aria-expanded={templatesOpen}
						className="mt-2 flex cursor-pointer items-center gap-1.5 text-xs font-medium text-stone-500 transition hover:text-stone-300"
					>
						<Sparkles className="size-3.5 text-amber-500/80" />
						Начать с шаблона
						<ChevronDown
							className={`size-3.5 transition-transform duration-200 ${templatesOpen ? "rotate-180" : ""}`}
						/>
					</button>
					<AnimatePresence initial={false}>
						{templatesOpen ? (
							<motion.div
								key="templates"
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: "auto", opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								transition={{ duration: 0.2, ease: "easeOut" }}
								className="overflow-hidden"
							>
								<div className="mt-2.5 grid grid-cols-2 gap-1.5">
									{DESCRIPTION_TEMPLATES.map((t) => {
										const isApplied =
											description === t.text;
										const isConfirm =
											confirmTemplate === t.id;
										const Icon = t.icon;
										return (
											<button
												key={t.id}
												type="button"
												onClick={() => applyTemplate(t)}
												className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition ${
													isConfirm
														? "border-amber-500/60 bg-amber-500/10 text-amber-300"
														: isApplied
															? "border-amber-500/40 bg-stone-950 text-stone-200"
															: "border-stone-800 bg-stone-950/60 text-stone-400 hover:border-stone-600 hover:text-stone-200"
												}`}
											>
												<Icon
													className={`size-3.5 shrink-0 ${
														isApplied || isConfirm
															? "text-amber-400"
															: "text-stone-500"
													}`}
												/>
												<span className="truncate">
													{isConfirm
														? "Заменить текст?"
														: t.label}
												</span>
											</button>
										);
									})}
								</div>
								<p className="mt-2 text-[11px] leading-snug text-stone-600">
									Шаблон подставит структуру — замените «…»
									своими ответами
								</p>
							</motion.div>
						) : null}
					</AnimatePresence>
				</div>
				<button
					type="submit"
					disabled={!canSubmit || saving}
					className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{saving ? (
						<Loader2 className="size-4 animate-spin" />
					) : null}
					Добавить идею
				</button>
			</form>
		</DialogShell>
	);
}

const CATALOG_FEATURES: { icon: LucideIcon; label: string; sub: string }[] = [
	{ icon: Gift, label: "Бесплатно", sub: "одна в день" },
	{ icon: Fingerprint, label: "Без повторов", sub: "только ваша" },
	{ icon: Zap, label: "Мгновенно", sub: "без ожидания" },
];

function CatalogDialog({ onClose }: { onClose: () => void }) {
	const { addCatalogIdea, catalogStatus } = useIdeasDemo();
	const [loading, setLoading] = useState(false);
	const poolEmpty = catalogStatus.poolLeft <= 0;
	const available = !catalogStatus.usedToday && !poolEmpty;

	return (
		<DialogShell title="Идея из каталога" onClose={onClose}>
			{/* Кубик с янтарным свечением — визуальный центр модалки */}
			<div className="relative mx-auto mt-1 flex size-20 items-center justify-center">
				<div
					className="absolute inset-0 rounded-3xl bg-amber-500/20 blur-2xl"
					aria-hidden
				/>
				<motion.div
					initial={{ rotate: -8, scale: 0.9 }}
					animate={{ rotate: 0, scale: 1 }}
					transition={{ type: "spring", damping: 12, stiffness: 200 }}
					className="relative flex size-16 items-center justify-center rounded-2xl border border-amber-500/30 bg-gradient-to-b from-stone-800 to-stone-900 shadow-lg shadow-black/40"
				>
					<Dices className="size-7 text-amber-400" />
				</motion.div>
			</div>

			<p className="mt-4 text-center text-sm leading-relaxed text-stone-400">
				Случайная идея из подборки Ideapick.
			</p>

			<div className="mt-4 grid grid-cols-3 gap-1.5">
				{CATALOG_FEATURES.map((f) => {
					const Icon = f.icon;
					return (
						<div
							key={f.label}
							className="flex flex-col items-center gap-1 rounded-xl border border-stone-800 bg-stone-950/60 px-2 py-2.5 text-center"
						>
							<Icon className="size-4 text-amber-500/80" />
							<span className="text-[11px] font-medium leading-tight text-stone-300">
								{f.label}
							</span>
							<span className="text-[10px] -mt-1 leading-tight text-stone-600">
								{f.sub}
							</span>
						</div>
					);
				})}
			</div>

			{available ? (
				<button
					type="button"
					disabled={loading}
					onClick={async () => {
						setLoading(true);
						const ok = await addCatalogIdea();
						if (!ok) setLoading(false);
					}}
					className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{loading ? (
						<Loader2 className="size-4 animate-spin" />
					) : null}
					Получить идею дня
				</button>
			) : (
				<>
					<div
						className={`mt-5 flex items-center gap-3 rounded-xl border px-4 py-3 ${
							poolEmpty
								? "border-stone-700/60 bg-stone-800/40"
								: "border-emerald-500/20 bg-emerald-500/[0.06]"
						}`}
					>
						{poolEmpty ? (
							<PackageOpen className="size-5 shrink-0 text-stone-400" />
						) : (
							<CheckCircle2 className="size-5 shrink-0 text-emerald-400" />
						)}
						<div className="min-w-0">
							<p className="text-sm font-medium text-stone-200">
								{poolEmpty
									? "Свободные идеи закончились"
									: "Идея дня уже у вас"}
							</p>
							<p className="mt-0.5 flex items-center gap-1 text-xs text-stone-500">
								{poolEmpty ? (
									"Каталог скоро пополнится — загляните позже"
								) : (
									<>
										<CalendarClock className="size-3.5" />
										Следующая — завтра
									</>
								)}
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="mt-3 w-full cursor-pointer rounded-xl border border-stone-700 py-2.5 text-sm font-medium text-stone-300 transition hover:bg-stone-800"
					>
						Понятно
					</button>
				</>
			)}
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
					AI сгенерирует идею на основе ваших ответов. Списание с
					баланса после подтверждения.
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
					{loading ? (
						<Loader2 className="size-4 animate-spin" />
					) : null}
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
			<p className="text-sm font-medium text-stone-200">
				{current.question}
			</p>
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
				<CatalogDialog key="random" onClose={closeDialog} />
			) : null}
			{activeDialog === "anamnesis" ? (
				<AnamnesisDialog key="anamnesis" onClose={closeDialog} />
			) : null}
		</AnimatePresence>
	);
}

const TOAST_META: Record<
	ToastKind,
	{ icon: LucideIcon; iconText: string; chipBg: string; bar: string }
> = {
	success: {
		icon: CheckCircle2,
		iconText: "text-emerald-400",
		chipBg: "bg-emerald-500/15",
		bar: "bg-emerald-400/70",
	},
	error: {
		icon: AlertCircle,
		iconText: "text-red-400",
		chipBg: "bg-red-500/15",
		bar: "bg-red-400/70",
	},
	info: {
		icon: Info,
		iconText: "text-amber-400",
		chipBg: "bg-amber-500/15",
		bar: "bg-amber-400/70",
	},
};

export function DemoToast() {
	const { toast } = useIdeasDemo();
	const meta = toast ? TOAST_META[toast.kind] : null;
	const Icon = meta?.icon;

	return (
		<AnimatePresence>
			{toast && meta && Icon ? (
				<motion.div
					key={toast.id}
					initial={{ opacity: 0, y: 16, scale: 0.96 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: 8, scale: 0.98 }}
					transition={{ type: "spring", damping: 26, stiffness: 380 }}
					className="fixed bottom-24 left-1/2 z-50 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2"
				>
					<div className="relative overflow-hidden rounded-xl border border-stone-700 bg-stone-900 shadow-xl shadow-black/40 ring-1 ring-white/5">
						<div className="flex items-center gap-2.5 py-2.5 pl-3 pr-4 text-sm text-stone-200">
							<span
								className={`flex size-6 shrink-0 items-center justify-center rounded-full ${meta.chipBg}`}
							>
								<Icon className={`size-4 ${meta.iconText}`} />
							</span>
							<span className="min-w-0">{toast.message}</span>
						</div>
						<motion.div
							initial={{ scaleX: 1 }}
							animate={{ scaleX: 0 }}
							transition={{
								duration: TOAST_DURATION_MS / 1000,
								ease: "linear",
							}}
							className={`absolute bottom-0 left-0 h-0.5 w-full origin-left ${meta.bar}`}
						/>
					</div>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
