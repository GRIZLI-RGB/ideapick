/** SVG-шум — тонкий grain поверх фона */
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

/** Базовый градиент + grain, общие для всех вариантов фона */
export function SharedBgLayers() {
	return (
		<>
			<div
				className="absolute inset-0 bg-[linear-gradient(180deg,rgb(20_18_15)_0%,rgb(11_10_9)_22%,rgb(12_11_10)_78%,rgb(16_14_12)_100%)]"
				aria-hidden
			/>
			<div
				className="absolute inset-0 opacity-[0.35]"
				style={{
					backgroundImage: GRAIN_SVG,
					backgroundRepeat: "repeat",
					backgroundSize: "300px 300px",
				}}
				aria-hidden
			/>
		</>
	);
}
