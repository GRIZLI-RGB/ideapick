"use client";

import { useIdeasDemo } from "@/components/ideas/ideas-demo-provider";
import { HEADER_SCALE } from "@/lib/app/header-scale";
import { Wallet } from "lucide-react";

type BalanceChipProps = {
	balance: number;
};

export function BalanceChip({ balance }: BalanceChipProps) {
	const { openWallet } = useIdeasDemo();

	return (
		<button
			type="button"
			onClick={openWallet}
			className={`flex shrink-0 cursor-pointer items-center border border-stone-700/80 bg-stone-900/90 font-semibold tabular-nums text-stone-100 transition hover:border-amber-500/30 hover:bg-stone-800/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 ${HEADER_SCALE.balance}`}
			aria-label={`Баланс ${balance} рублей, открыть кошелёк`}
		>
			<Wallet className={`${HEADER_SCALE.wallet} text-amber-400`} />
			{balance} ₽
		</button>
	);
}
