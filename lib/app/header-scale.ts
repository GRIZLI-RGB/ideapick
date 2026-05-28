/** Единый масштаб шапки — совпадает с login и карточками */
export const HEADER_SCALE = {
	height: "h-14",
	logo: 28,
	nav: "px-3 py-1.5 text-xs font-medium sm:px-3.5 sm:py-2 sm:text-sm",
	balance: "gap-2 rounded-xl px-3 py-1.5 text-sm sm:px-3.5 sm:py-2",
	icon: "size-3.5 sm:size-4",
	wallet: "size-4",
} as const;

export type AppNavId = "ideas" | "compare" | "settings";

export function resolveAppNavId(pathname: string): AppNavId {
	if (pathname.startsWith("/app/compare")) return "compare";
	if (pathname.startsWith("/app/settings")) return "settings";
	return "ideas";
}
