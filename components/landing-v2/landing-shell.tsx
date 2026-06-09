import { SITE_SHELL_CLASS } from "@/lib/site-theme";

/** SVG-шум — накладывается тонким grain поверх фона */
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

/**
 * Shell v2: фоновая «жизнь» распределена по всей высоте страницы.
 * Главный глоу — у hero, дальше живость дают локальные свечения секций
 * и вертикальные направляющие по краям контента.
 */
export function LandingShell({ children }: { children: React.ReactNode }) {
	return (
		<div className={`relative overflow-x-clip ${SITE_SHELL_CLASS}`}>
			{/* Базовый градиент страницы — чуть светлее у верха и низа, чтобы не было «ямы» */}
			<div
				className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(180deg,rgb(20_18_15)_0%,rgb(11_10_9)_22%,rgb(12_11_10)_78%,rgb(16_14_12)_100%)]"
				aria-hidden
			/>

			{/* Глоу hero — привязан к странице, уезжает вместе со скроллом */}
			<div
				className="animate-glow-breathe pointer-events-none absolute left-1/2 top-0 -z-10 h-[560px] w-[780px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgb(245_158_11/0.17)_0%,transparent_68%)]"
				aria-hidden
			/>
			<div
				className="pointer-events-none absolute right-0 top-24 -z-10 h-[420px] w-[420px] translate-x-1/4 rounded-full bg-[radial-gradient(ellipse,rgb(245_158_11/0.07)_0%,transparent_70%)]"
				aria-hidden
			/>

			{/* Вертикальные направляющие по краям контента (только широкие экраны) */}
			<div
				className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 hidden w-px -translate-x-[36.5rem] bg-gradient-to-b from-transparent via-stone-800/45 to-transparent xl:block"
				aria-hidden
			/>
			<div
				className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 hidden w-px translate-x-[36.5rem] bg-gradient-to-b from-transparent via-stone-800/45 to-transparent xl:block"
				aria-hidden
			/>

			{/* Точечная сетка сверху страницы */}
			<div
				className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px]"
				style={{
					backgroundImage:
						"radial-gradient(circle, rgb(168 162 158 / 0.08) 1px, transparent 1px)",
					backgroundSize: "24px 24px",
					maskImage:
						"linear-gradient(180deg, black 0%, black 45%, transparent 100%)",
					WebkitMaskImage:
						"linear-gradient(180deg, black 0%, black 45%, transparent 100%)",
				}}
				aria-hidden
			/>

			{/* Grain-текстура */}
			<div
				className="pointer-events-none fixed inset-0 -z-10 opacity-[0.35]"
				style={{
					backgroundImage: GRAIN_SVG,
					backgroundRepeat: "repeat",
					backgroundSize: "300px 300px",
				}}
				aria-hidden
			/>

			{children}
		</div>
	);
}
