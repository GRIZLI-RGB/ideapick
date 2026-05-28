"use client";

import Link from "next/link";
import { HEADER_SCALE } from "@/lib/app/header-scale";
import { Wallet } from "lucide-react";

type BalanceChipProps = {
	balance: number;
};

export function BalanceChip({ balance }: BalanceChipProps) {
	return (
		<Link
			href="/app/settings"
			className={`flex shrink-0 items-center border border-stone-700/80 bg-stone-900/90 font-semibold tabular-nums text-stone-100 transition hover:border-amber-500/30 hover:bg-stone-800/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 ${HEADER_SCALE.balance}`}
		>
			<Wallet className={`${HEADER_SCALE.wallet} text-amber-400`} />
			{balance} ₽
		</Link>
	);
}
