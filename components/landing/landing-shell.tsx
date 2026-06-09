import { SITE_SHELL_CLASS } from "@/lib/site-theme";

/** SVG-шум — накладывается тонким grain поверх фона */
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

export function LandingShell({ children }: { children: React.ReactNode }) {
	return (
		<div className={`relative overflow-x-hidden ${SITE_SHELL_CLASS}`}>
			{/* Базовый градиент страницы */}
			<div
				className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(180deg,rgb(18_16_14)_0%,rgb(10_9_8)_25%,rgb(10_9_8)_100%)]"
				aria-hidden
			/>

			{/* Главный amber-орб — сверху по центру, медленно пульсирует */}
			<div
				className="animate-glow-breathe pointer-events-none fixed left-1/2 top-0 -z-10 h-[520px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgb(245_158_11/0.18)_0%,transparent_68%)]"
				aria-hidden
			/>

			{/* Боковой орб — правый верх */}
			<div
				className="pointer-events-none fixed right-0 top-0 -z-10 h-[420px] w-[420px] translate-x-1/4 -translate-y-1/4 rounded-full bg-[radial-gradient(ellipse,rgb(245_158_11/0.07)_0%,transparent_70%)] animate-glow-breathe [animation-delay:2s]"
				aria-hidden
			/>

			{/* Левый нижний орб — холодный акцент */}
			<div
				className="pointer-events-none fixed bottom-1/3 left-0 -z-10 h-[350px] w-[350px] -translate-x-1/3 rounded-full bg-[radial-gradient(ellipse,rgb(168_85_247/0.05)_0%,transparent_70%)] animate-glow-breathe [animation-delay:1.5s]"
				aria-hidden
			/>

			{/* Точечная сетка, замаскирована снизу */}
			<div
				className="pointer-events-none fixed inset-0 -z-10"
				style={{
					backgroundImage:
						"radial-gradient(circle, rgb(168 162 158 / 0.07) 1px, transparent 1px)",
					backgroundSize: "24px 24px",
					maskImage:
						"linear-gradient(180deg, black 0%, black 40%, transparent 90%)",
					WebkitMaskImage:
						"linear-gradient(180deg, black 0%, black 40%, transparent 90%)",
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
