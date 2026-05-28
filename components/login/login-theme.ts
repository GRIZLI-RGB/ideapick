import type { CSSProperties } from "react";

export type AuthThemeOverlay =
	| { kind: "class"; className: string }
	| { kind: "style"; style: CSSProperties };

export type LoginAuthTheme = {
	shell: string;
	aside: {
		base: string;
		overlays: AuthThemeOverlay[];
		label: string;
		phaseActive: string;
		phaseInactive: string;
	};
	demo: {
		card: string;
		skeleton: string;
		border: string;
		borderDashed: string;
		label: string;
		text: string;
		muted: string;
		innerBg: string;
		scoreRing: string;
		scoreRingActive: string;
		sparkles: string;
		loader: string;
	};
	main: {
		bg: string;
		heading: string;
		googleBtn: string;
		divider: string;
		dividerText: string;
		input: string;
		cta: string;
		link: string;
		muted: string;
		body: string;
		sentCard: string;
		sentIcon: string;
		secondaryBtn: string;
	};
};

const DOT = (color: string): AuthThemeOverlay => ({
	kind: "style",
	style: {
		backgroundImage: `radial-gradient(circle, ${color} 1.25px, transparent 1.25px)`,
		backgroundSize: "20px 20px",
	},
});

/** Тёмный янтарь — выбранная тема логина */
export const LOGIN_AUTH_THEME: LoginAuthTheme = {
	shell: "bg-stone-950",
	aside: {
		base: "bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950",
		overlays: [
			{
				kind: "class",
				className:
					"bg-[radial-gradient(ellipse_at_80%_20%,rgb(245_158_11/0.12),transparent_45%)]",
			},
			DOT("rgb(168 162 158 / 0.1)"),
		],
		label: "text-amber-100/75",
		phaseActive: "#fbbf24",
		phaseInactive: "#57534e",
	},
	demo: {
		card: "border border-stone-700/60 bg-stone-900/95 p-5 shadow-2xl shadow-black/50 ring-1 ring-amber-500/10",
		skeleton: "bg-stone-800",
		border: "border-stone-700",
		borderDashed: "border-dashed border-stone-600",
		label: "text-stone-500",
		text: "text-stone-100",
		muted: "text-stone-400",
		innerBg: "border border-stone-700/80 bg-stone-800/90",
		scoreRing: "stroke-stone-700",
		scoreRingActive: "stroke-amber-400",
		sparkles: "text-amber-400",
		loader: "text-stone-300",
	},
	main: {
		bg: "bg-stone-950",
		heading: "text-stone-50",
		googleBtn:
			"border border-stone-700 bg-stone-900 text-stone-100 hover:border-stone-600 hover:bg-stone-800",
		divider: "bg-stone-700",
		dividerText: "text-stone-500",
		input:
			"border border-stone-700 bg-stone-900 text-stone-100 placeholder:text-stone-500 focus:border-amber-500 focus:ring-amber-500/20",
		cta: "bg-amber-500 text-stone-950 hover:bg-amber-400",
		link: "text-stone-400 decoration-stone-600 hover:text-stone-200 hover:decoration-stone-400",
		muted: "text-stone-500",
		body: "text-stone-400",
		sentCard:
			"border border-stone-700 bg-stone-900 shadow-lg shadow-black/30 ring-1 ring-white/5",
		sentIcon: "bg-emerald-950 ring-1 ring-emerald-800/50",
		secondaryBtn:
			"border border-stone-700 bg-stone-900 text-stone-300 hover:border-stone-600 hover:bg-stone-800 hover:text-stone-100",
	},
};
