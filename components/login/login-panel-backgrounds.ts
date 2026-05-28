import { LOGIN_PANEL_GLOW_LAYERS } from "@/lib/site-theme";

export type LoginPanelBackground = {
	id: string;
	name: string;
	/** Кратко, для подсказки в превью */
	hint: string;
	recommended?: boolean;
	base: string;
	layers: string[];
};

/**
 * Фоны правой колонки логина.
 * Рекомендуемый: warm-glow — см. LOGIN_PANEL_RECOMMENDED_ID.
 */
export const LOGIN_PANEL_BACKGROUNDS: LoginPanelBackground[] = [
	{
		id: "flat",
		name: "Ровный",
		hint: "stone-950 без эффектов — как было",
		base: "bg-stone-950",
		layers: [],
	},
	{
		id: "warm-glow",
		name: "Тёплое свечение",
		hint: "Мягкий amber сверху + лёгкий переход слева",
		recommended: true,
		base: "bg-stone-950",
		layers: [...LOGIN_PANEL_GLOW_LAYERS],
	},
	{
		id: "elevated",
		name: "Панель светлее",
		hint: "stone-900 — чуть отделяется от левой части",
		base: "bg-stone-900",
		layers: [
			"bg-[radial-gradient(ellipse_at_50%_0%,rgb(255_255_255/0.03),transparent_50%)]",
		],
	},
	{
		id: "seam-light",
		name: "Стык слева",
		hint: "Янтарный градиент от разделителя колонок",
		base: "bg-stone-950",
		layers: [
			"bg-[linear-gradient(90deg,rgb(245_158_11/0.07),transparent_28%)]",
		],
	},
	{
		id: "focus-well",
		name: "Подсветка формы",
		hint: "Свечение только вокруг блока входа",
		base: "bg-stone-950",
		layers: [
			"bg-[radial-gradient(ellipse_at_50%_45%,rgb(245_158_11/0.11),transparent_52%)]",
			"bg-[radial-gradient(ellipse_at_50%_100%,rgb(0_0_0/0.2),transparent_45%)]",
		],
	},
	{
		id: "depth",
		name: "Глубина",
		hint: "Тёплый верх + затемнение снизу",
		base: "bg-stone-950",
		layers: [
			"bg-[radial-gradient(ellipse_at_50%_0%,rgb(168_162_158/0.08),transparent_55%)]",
			"bg-[radial-gradient(ellipse_at_50%_100%,rgb(0_0_0/0.35),transparent_50%)]",
		],
	},
];

export const LOGIN_PANEL_RECOMMENDED_ID = "warm-glow";

export function getLoginPanelBackground(id: string): LoginPanelBackground {
	return (
		LOGIN_PANEL_BACKGROUNDS.find((b) => b.id === id) ??
		LOGIN_PANEL_BACKGROUNDS.find((b) => b.id === LOGIN_PANEL_RECOMMENDED_ID)!
	);
}

export const LOGIN_PANEL_DEFAULT = getLoginPanelBackground(
	LOGIN_PANEL_RECOMMENDED_ID,
);
