/** Общая тёмная поверхность */
export const SITE_SHELL_CLASS = "min-h-dvh bg-stone-950 text-stone-100";

/**
 * Фон для длинных статичных страниц (legal и др.).
 * Равномернее, чем glow только сверху: лёгкий градиент на всю высоту + слабые акценты сверху и снизу.
 */
export const SITE_PAGE_AMBIENT_LAYERS = [
	"bg-[linear-gradient(180deg,rgb(28_25_23)_0%,rgb(12_10_9)_32%,rgb(12_10_9)_100%)]",
	"bg-[radial-gradient(ellipse_at_50%_12%,rgb(245_158_11/0.045),transparent_52%)]",
	"bg-[radial-gradient(ellipse_at_50%_88%,rgb(0_0_0/0.18),transparent_42%)]",
] as const;

/** Правая колонка логина — локальный акцент (как было) */
export const LOGIN_PANEL_GLOW_LAYERS = [
	"bg-[radial-gradient(ellipse_at_50%_0%,rgb(245_158_11/0.09),transparent_58%)]",
	"bg-[radial-gradient(ellipse_at_0%_40%,rgb(245_158_11/0.05),transparent_42%)]",
] as const;
