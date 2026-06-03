"use client";

import { motion } from "framer-motion";

type ScoreRingProps = {
	score: number;
	size?: "sm" | "md" | "lg";
	className?: string;
	ringClassName?: string;
	textClassName?: string;
};

const SIZE = {
	sm: { box: "size-9", text: "text-[9px]", r: 13, stroke: 2.5, dash: 82 },
	md: { box: "size-11", text: "text-[10px]", r: 15, stroke: 3, dash: 94 },
	lg: { box: "size-14", text: "text-xs", r: 16, stroke: 3, dash: 100 },
};

export function ScoreRing({
	score,
	size = "md",
	className,
	ringClassName = "stroke-amber-400",
	textClassName = "text-stone-300",
}: ScoreRingProps) {
	const s = SIZE[size];
	const dash = (score / 100) * s.dash;

	return (
		<div className={`relative shrink-0 ${s.box} ${className ?? ""}`}>
			<svg
				viewBox="-2 -2 40 40"
				className={`${s.box} -rotate-90 overflow-visible`}
				aria-hidden
			>
				<circle
					cx="18"
					cy="18"
					r={s.r}
					className="stroke-stone-700"
					strokeWidth={s.stroke}
					fill="none"
				/>
				<motion.circle
					cx="18"
					cy="18"
					r={s.r}
					className={ringClassName}
					strokeWidth={s.stroke}
					fill="none"
					strokeLinecap="round"
					initial={{ strokeDasharray: `0 ${s.dash}` }}
					animate={{ strokeDasharray: `${dash} ${s.dash}` }}
					transition={{ duration: 0.9, ease: "easeOut" }}
				/>
			</svg>
			<span
				className={`absolute inset-0 flex items-center justify-center font-bold tabular-nums ${textClassName} ${s.text}`}
			>
				{score}
			</span>
		</div>
	);
}

export function ScorePlaceholder({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
	const s = SIZE[size];
	return (
		<div
			className={`flex ${s.box} items-center justify-center rounded-full border border-dashed border-stone-600 bg-stone-900/50`}
		>
			<span className={`font-medium text-stone-500 ${s.text}`}>—</span>
		</div>
	);
}
