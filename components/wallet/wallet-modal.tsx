"use client";

import { TransactionList } from "@/components/wallet/transaction-list";
import { useIdeasDemo } from "@/components/ideas/ideas-demo-provider";
import {
	calcTopUpBonus,
	TOP_UP_MAX,
	TOP_UP_MIN,
	TOP_UP_PRESETS,
} from "@/lib/wallet/bonus";
import { AnimatePresence, motion } from "framer-motion";
import { Gift, Loader2, Wallet, X } from "lucide-react";
import { useEffect, useState } from "react";

function clampAmount(raw: number) {
	if (Number.isNaN(raw)) return TOP_UP_MIN;
	return Math.min(TOP_UP_MAX, Math.max(TOP_UP_MIN, Math.floor(raw)));
}

export function WalletModal() {
	const { walletOpen, closeWallet, topUp } = useIdeasDemo();
	const [amountStr, setAmountStr] = useState("1000");
	const [loading, setLoading] = useState(false);

	const parsed = Number(amountStr);
	const amountValid =
		amountStr.trim() !== "" &&
		Number.isFinite(parsed) &&
		Number.isInteger(parsed) &&
		parsed >= TOP_UP_MIN &&
		parsed <= TOP_UP_MAX;
	const amount = amountValid ? parsed : clampAmount(parsed);
	const bonus = amountValid ? calcTopUpBonus(amount) : 0;
	const showBonus = amountValid && bonus > 0;

	useEffect(() => {
		if (!walletOpen) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") closeWallet();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [walletOpen, closeWallet]);

	async function handleTopUp() {
		if (!amountValid || loading) return;
		setLoading(true);
		const ok = await topUp(amount);
		// При успехе происходит редирект на оплату — спиннер не сбрасываем.
		if (!ok) setLoading(false);
	}

	return (
		<AnimatePresence>
			{walletOpen ? (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
					onClick={closeWallet}
				>
					<motion.div
						initial={{ opacity: 0, y: 24 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 16 }}
						transition={{ type: "spring", damping: 28, stiffness: 320 }}
						className="flex max-h-[min(90vh,680px)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-stone-700/80 bg-stone-900 shadow-2xl shadow-black/60 ring-1 ring-white/5"
						onClick={(e) => e.stopPropagation()}
						role="dialog"
						aria-modal="true"
						aria-labelledby="wallet-title"
					>
						<div className="flex shrink-0 items-center justify-between border-b border-stone-800 px-5 py-4">
							<h2
								id="wallet-title"
								className="flex items-center gap-2 text-base font-semibold text-stone-100"
							>
								<Wallet className="size-4 text-amber-400" />
								Пополнение
							</h2>
							<button
								type="button"
								onClick={closeWallet}
								className="cursor-pointer rounded-lg p-1.5 text-stone-500 transition hover:bg-stone-800 hover:text-stone-300"
								aria-label="Закрыть"
							>
								<X className="size-4" />
							</button>
						</div>

						<div className="flex min-h-0 flex-1 flex-col px-5 py-4">
							<div className="shrink-0">
								<label
									htmlFor="topup-amount"
									className="text-sm font-medium text-stone-200"
								>
									Сумма
								</label>
								<div
									className={`mt-2 flex items-center overflow-hidden rounded-xl border bg-stone-950/60 transition focus-within:border-amber-500/40 focus-within:ring-2 focus-within:ring-amber-500/20 ${
										showBonus
											? "border-amber-500/25"
											: "border-stone-700"
									}`}
								>
									<input
										id="topup-amount"
										type="number"
										inputMode="numeric"
										min={TOP_UP_MIN}
										max={TOP_UP_MAX}
										step={1}
										value={amountStr}
										onChange={(e) => setAmountStr(e.target.value)}
										aria-describedby={
											showBonus ? "topup-bonus-hint" : undefined
										}
										className={`wallet-amount-input min-w-0 flex-1 bg-transparent py-2.5 pl-3 text-sm tabular-nums text-stone-100 outline-none ${
											showBonus ? "pr-2" : "pr-3"
										}`}
									/>
									{showBonus ? (
										<span
											id="topup-bonus-hint"
											className="mr-2 flex shrink-0 items-center gap-1 rounded-lg bg-amber-500/15 px-2 py-1 text-xs font-semibold tabular-nums text-amber-300 ring-1 ring-amber-500/20"
										>
											<Gift
												className="size-3.5 shrink-0 text-amber-400/90"
												aria-hidden
											/>
											+{bonus}
											<span className="text-amber-400/70">₽</span>
										</span>
									) : (
										<span
											className="pr-3 text-sm text-stone-500"
											aria-hidden
										>
											₽
										</span>
									)}
								</div>
								<p className="mt-1.5 text-xs text-stone-500">
									{TOP_UP_MIN.toLocaleString("ru-RU")}–
									{TOP_UP_MAX.toLocaleString("ru-RU")} ₽
								</p>

								<div className="mt-3 grid grid-cols-4 gap-2">
									{TOP_UP_PRESETS.map((preset) => {
										const active = amountValid && amount === preset;
										return (
											<button
												key={preset}
												type="button"
												onClick={() => setAmountStr(String(preset))}
												aria-pressed={active}
												className={`cursor-pointer rounded-lg border px-2 py-1.5 text-xs font-semibold tabular-nums transition ${
													active
														? "border-amber-500/40 bg-amber-500/15 text-amber-200"
														: "border-stone-700 bg-stone-950/60 text-stone-300 hover:border-stone-600 hover:bg-stone-800/60"
												}`}
											>
												{preset.toLocaleString("ru-RU")}
											</button>
										);
									})}
								</div>
							</div>

							<button
								type="button"
								disabled={!amountValid || loading}
								onClick={handleTopUp}
								className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{loading ? (
									<Loader2 className="size-4 animate-spin" aria-hidden />
								) : null}
								{loading ? "Переход к оплате…" : "Пополнить"}
							</button>

							<p className="mt-2.5 shrink-0 text-center text-xs text-stone-500">
								Безопасная оплата через ЮKassa — банковские
								карты, СБП
							</p>

							<div className="mt-6 flex min-h-0 flex-1 flex-col">
								<h3 className="mb-2 shrink-0 text-xs font-semibold uppercase tracking-wider text-stone-500">
									История
								</h3>
								<TransactionList />
							</div>
						</div>
					</motion.div>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
