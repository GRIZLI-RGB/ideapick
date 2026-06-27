// Цветовые акценты рубрик блога. Классы заданы статичными строками целиком,
// чтобы их видел JIT Tailwind (без динамической склейки имён классов).

export type CategoryStyle = {
	/** Бейдж рубрики: рамка + фон + текст. */
	badge: string;
	/** Цвет точки-маркёра. */
	dot: string;
	/** Цвет локального свечения карточки (для inline-стиля). */
	glow: string;
};

const DEFAULT_STYLE: CategoryStyle = {
	badge: "border-amber-500/30 bg-amber-500/10 text-amber-300",
	dot: "bg-amber-400",
	glow: "rgb(245 158 11 / 0.10)",
};

const STYLES: Record<string, CategoryStyle> = {
	Гайды: {
		badge: "border-amber-500/30 bg-amber-500/10 text-amber-300",
		dot: "bg-amber-400",
		glow: "rgb(245 158 11 / 0.10)",
	},
	Старт: {
		badge: "border-orange-500/30 bg-orange-500/10 text-orange-300",
		dot: "bg-orange-400",
		glow: "rgb(249 115 22 / 0.10)",
	},
	Маркетинг: {
		badge: "border-sky-500/30 bg-sky-500/10 text-sky-300",
		dot: "bg-sky-400",
		glow: "rgb(56 189 248 / 0.10)",
	},
	Идеи: {
		badge: "border-violet-500/30 bg-violet-500/10 text-violet-300",
		dot: "bg-violet-400",
		glow: "rgb(167 139 250 / 0.10)",
	},
	Финансы: {
		badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
		dot: "bg-emerald-400",
		glow: "rgb(52 211 153 / 0.10)",
	},
	Стратегия: {
		badge: "border-teal-500/30 bg-teal-500/10 text-teal-300",
		dot: "bg-teal-400",
		glow: "rgb(45 212 191 / 0.10)",
	},
	AI: {
		badge: "border-rose-500/30 bg-rose-500/10 text-rose-300",
		dot: "bg-rose-400",
		glow: "rgb(251 113 133 / 0.10)",
	},
};

export function categoryStyle(category: string | null): CategoryStyle {
	return (category && STYLES[category]) || DEFAULT_STYLE;
}
