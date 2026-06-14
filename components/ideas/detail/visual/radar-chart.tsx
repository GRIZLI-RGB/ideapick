"use client";

import { RADAR_AXIS_LABELS } from "@/lib/analysis/visual-metrics";

type RadarChartProps = {
	values: number[];
	/** Подписи осей; по умолчанию — 5 базовых. Длина может быть любой. */
	labels?: string[];
	/** Фиксированный размер; без size — заполняет родителя по CSS */
	size?: number;
	className?: string;
	onAxisClick?: (index: number) => void;
};

/** Чуть шире справа под подписи; центр смещён влево */
const VIEW_W = 272;
const VIEW_H = 256;
const CX = VIEW_W / 2 - 12;
const CY = VIEW_H / 2;
const MAX_R = 72;
const LABEL_R = MAX_R + 20;

function polar(r: number, i: number, axes: number) {
	const angle = (Math.PI * 2 * i) / axes - Math.PI / 2;
	return {
		x: CX + r * Math.cos(angle),
		y: CY + r * Math.sin(angle),
	};
}

function polygonPoints(r: number, values: number[], axes: number) {
	return values
		.map((v, i) => {
			const p = polar(r * Math.max(0.08, v), i, axes);
			return `${p.x},${p.y}`;
		})
		.join(" ");
}

/** Якорь подписи по горизонтали относительно центра (для вершин сверху/снизу — middle). */
function labelAnchor(x: number): "middle" | "start" | "end" {
	if (Math.abs(x - CX) < 6) return "middle";
	return x > CX ? "start" : "end";
}

export function RadarChart({
	values,
	labels = RADAR_AXIS_LABELS,
	size,
	className = "",
	onAxisClick,
}: RadarChartProps) {
	const axes = values.length;
	const gridLevels = [0.25, 0.5, 0.75, 1];
	const sizeProps =
		size != null ? { width: size, height: size } : { width: "100%", height: "100%" };

	return (
		<svg
			viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
			preserveAspectRatio="xMidYMid meet"
			className={`overflow-visible ${className}`.trim()}
			role="img"
			aria-label="Профиль идеи по факторам"
			{...sizeProps}
		>
			{gridLevels.map((g) => (
				<polygon
					key={g}
					points={polygonPoints(MAX_R * g, Array(axes).fill(1), axes)}
					fill="none"
					className="stroke-stone-700/80"
					strokeWidth="1"
				/>
			))}
			{Array.from({ length: axes }, (_, i) => {
				const outer = polar(MAX_R, i, axes);
				return (
					<line
						key={i}
						x1={CX}
						y1={CY}
						x2={outer.x}
						y2={outer.y}
						className="stroke-stone-800"
						strokeWidth="1"
					/>
				);
			})}
			<polygon
				points={polygonPoints(MAX_R, values, axes)}
				className="fill-amber-500/20 stroke-amber-400/90"
				strokeWidth="2"
			/>
			{values.map((_, i) => {
				const p = polar(MAX_R * Math.max(0.08, values[i]), i, axes);
				return (
					<circle
						key={i}
						cx={p.x}
						cy={p.y}
						r={onAxisClick ? 6 : 4}
						className={
							onAxisClick
								? "cursor-pointer fill-amber-400 stroke-stone-900 stroke-2"
								: "fill-amber-400"
						}
						onClick={onAxisClick ? () => onAxisClick(i) : undefined}
					/>
				);
			})}
			{labels.map((label, i) => {
				const p = polar(LABEL_R, i, axes);
				return (
					<text
						key={label}
						x={p.x}
						y={p.y}
						textAnchor={labelAnchor(p.x)}
						dominantBaseline="middle"
						className="fill-stone-500 text-[11px] font-medium"
					>
						{label}
					</text>
				);
			})}
		</svg>
	);
}

export const RADAR_SECTION_KEYS = [
	"demand",
	"competition",
	"monetization",
	"execution",
	"risks",
] as const;
