"use client";

import { useIdeasDemo } from "@/components/ideas/ideas-demo-provider";
import type { Transaction, TransactionKind } from "@/lib/wallet/types";
import {
	ArrowDownLeft,
	ArrowUpRight,
	ChevronLeft,
	ChevronRight,
	Gift,
	RotateCcw,
	Sparkles,
	Wallet,
} from "lucide-react";
import { useState } from "react";

const HISTORY_PAGE_SIZE = 5;

const KIND_META: Record<
	TransactionKind,
	{ icon: typeof Wallet; credit: boolean }
> = {
	welcome: { icon: Gift, credit: true },
	topup: { icon: Wallet, credit: true },
	bonus: { icon: Gift, credit: true },
	anamnesis: { icon: Sparkles, credit: false },
	analysis: { icon: ArrowUpRight, credit: false },
	refund: { icon: RotateCcw, credit: true },
	adjustment: { icon: Wallet, credit: true },
};

function formatDate(iso: string) {
	return new Intl.DateTimeFormat("ru-RU", {
		day: "numeric",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(iso));
}

function formatAmount(amount: number) {
	const sign = amount > 0 ? "+" : "";
	return `${sign}${amount} ₽`;
}

function TransactionRow({
	tx,
	showDivider,
}: {
	tx: Transaction;
	showDivider: boolean;
}) {
	const meta = KIND_META[tx.kind];
	const Icon = meta.icon;
	const isCredit = tx.amount > 0;

	return (
		<li className={showDivider ? "border-b border-stone-800/60" : undefined}>
			<div className="flex items-center gap-3 px-2 py-2.5 transition-[background-color,border-radius] duration-150 hover:rounded-xl hover:bg-stone-800/70">
				<div
					className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
						isCredit
							? "bg-emerald-500/10 text-emerald-400"
							: "bg-stone-800/80 text-stone-400"
					}`}
				>
					<Icon className="size-4" />
				</div>
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium text-stone-200">
						{tx.label}
					</p>
					<p className="text-xs text-stone-500">{formatDate(tx.createdAt)}</p>
				</div>
				<span
					className={`shrink-0 text-sm font-semibold tabular-nums ${
						isCredit ? "text-emerald-400" : "text-stone-400"
					}`}
				>
					{formatAmount(tx.amount)}
				</span>
				{isCredit ? (
					<ArrowDownLeft
						className="size-3.5 shrink-0 text-emerald-500/50"
						aria-hidden
					/>
				) : null}
			</div>
		</li>
	);
}

export function TransactionList() {
	// Список монтируется только при открытии модалки кошелька, поэтому
	// страница естественно сбрасывается на каждое открытие — эффект не нужен.
	const { transactions } = useIdeasDemo();
	const [page, setPage] = useState(0);

	if (transactions.length === 0) {
		return (
			<p className="rounded-xl border border-dashed border-stone-700 px-4 py-6 text-center text-sm text-stone-500">
				Операций пока нет
			</p>
		);
	}

	const pageCount = Math.ceil(transactions.length / HISTORY_PAGE_SIZE);
	// Защита от выхода за границы, если список изменился (напр. после пополнения).
	const safePage = Math.min(page, pageCount - 1);
	const start = safePage * HISTORY_PAGE_SIZE;
	const visible = transactions.slice(start, start + HISTORY_PAGE_SIZE);

	return (
		<div className="flex min-h-0 flex-col">
			<div className="no-scrollbar max-h-52 overflow-y-auto sm:max-h-60">
				<ul>
					{visible.map((tx, index) => (
						<TransactionRow
							key={tx.id}
							tx={tx}
							showDivider={index < visible.length - 1}
						/>
					))}
				</ul>
			</div>

			{pageCount > 1 ? (
				<div className="mt-2 flex shrink-0 items-center justify-between gap-2">
					<button
						type="button"
						onClick={() => setPage((p) => Math.max(0, p - 1))}
						disabled={safePage === 0}
						aria-label="Предыдущие операции"
						className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-stone-700/80 bg-stone-950/40 text-stone-300 transition hover:border-stone-600 hover:bg-stone-800/50 hover:text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 disabled:cursor-default disabled:opacity-40 disabled:hover:border-stone-700/80 disabled:hover:bg-stone-950/40"
					>
						<ChevronLeft className="size-4" />
					</button>
					<span className="text-xs tabular-nums text-stone-500">
						{safePage + 1} из {pageCount}
					</span>
					<button
						type="button"
						onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
						disabled={safePage >= pageCount - 1}
						aria-label="Следующие операции"
						className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-stone-700/80 bg-stone-950/40 text-stone-300 transition hover:border-stone-600 hover:bg-stone-800/50 hover:text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 disabled:cursor-default disabled:opacity-40 disabled:hover:border-stone-700/80 disabled:hover:bg-stone-950/40"
					>
						<ChevronRight className="size-4" />
					</button>
				</div>
			) : null}
		</div>
	);
}
