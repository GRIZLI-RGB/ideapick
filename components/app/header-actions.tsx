"use client";

import { AccountMenuShell } from "@/components/app/header-account-menu";
import { useIdeasDemo } from "@/components/ideas/ideas-demo-provider";
import { ChevronDown, Wallet } from "lucide-react";

const PILL =
	"flex cursor-pointer items-center rounded-xl border border-stone-700/80 bg-stone-900/90 transition hover:border-stone-600 hover:bg-stone-800/90";

const CHEVRON =
	"size-3.5 shrink-0 text-stone-500 transition group-data-[state=open]/account:rotate-180";

/** Шапка: вариант AA — кошелёк + сумма + стрелка */
export function HeaderActions({ balance }: { balance: number }) {
	return (
		<div className="flex justify-end">
			<AccountMenuShell ariaLabel="Баланс и аккаунт" trigger={
				<span
					className={`${PILL} gap-2 px-3 py-1.5 text-sm font-semibold tabular-nums sm:px-3.5 sm:py-2`}
				>
					<Wallet className="size-4 text-amber-400" />
					<span className="text-stone-100">{balance} ₽</span>
					<ChevronDown className={CHEVRON} />
				</span>
			} />
		</div>
	);
}
