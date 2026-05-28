import type { Verdict } from "@/lib/ideas/types";
import { VERDICTS } from "@/lib/ideas/constants";

type VerdictBadgeProps = {
	verdict: Verdict;
	compact?: boolean;
};

export function VerdictBadge({ verdict, compact }: VerdictBadgeProps) {
	const v = VERDICTS[verdict];
	return (
		<span
			className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 sm:text-xs ${v.bg} ${v.color}`}
		>
			{compact ? v.short : v.label}
		</span>
	);
}

export function PendingBadge() {
	return (
		<span className="inline-flex items-center rounded-full bg-stone-800 px-2 py-0.5 text-[10px] font-medium text-stone-500 ring-1 ring-stone-700 sm:text-xs">
			Без анализа
		</span>
	);
}
