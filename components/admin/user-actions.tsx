"use client";

import { Ban, Loader2, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

async function postJson(url: string, body: unknown): Promise<void> {
	const res = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	if (!res.ok) {
		const data = await res.json().catch(() => null);
		throw new Error(
			data && typeof data.error === "string"
				? data.error
				: "Что-то пошло не так",
		);
	}
}

type UserActionsProps = {
	userId: string;
	banned: boolean;
	isSelf: boolean;
};

export function UserActions({ userId, banned, isSelf }: UserActionsProps) {
	const router = useRouter();
	const [amount, setAmount] = useState("");
	const [comment, setComment] = useState("");
	const [banReason, setBanReason] = useState("");
	const [busy, setBusy] = useState<"balance" | "ban" | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	async function run(
		kind: "balance" | "ban",
		action: () => Promise<void>,
		successMessage: string,
	) {
		setBusy(kind);
		setError(null);
		setSuccess(null);
		try {
			await action();
			setSuccess(successMessage);
			router.refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Что-то пошло не так");
		} finally {
			setBusy(null);
		}
	}

	async function handleAdjust(e: React.FormEvent) {
		e.preventDefault();
		const value = Number(amount);
		await run(
			"balance",
			() =>
				postJson(`/api/admin/users/${userId}/balance`, {
					amount: value,
					comment: comment || undefined,
				}),
			"Баланс обновлён",
		);
		setAmount("");
		setComment("");
	}

	async function handleBanToggle() {
		await run(
			"ban",
			() =>
				postJson(`/api/admin/users/${userId}/ban`, {
					banned: !banned,
					reason: banReason || undefined,
				}),
			banned ? "Пользователь разбанен" : "Пользователь забанен",
		);
		setBanReason("");
	}

	const inputCls =
		"rounded-xl border border-stone-700 bg-stone-950/60 px-3 py-2 text-sm text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20";

	return (
		<div className="space-y-4 rounded-2xl border border-stone-800/60 bg-stone-900/30 p-5">
			<h2 className="font-semibold text-stone-100">Действия</h2>

			<form onSubmit={handleAdjust} className="space-y-2">
				<p className="flex items-center gap-1.5 text-sm text-stone-400">
					<Wallet className="size-4" />
					Корректировка баланса
				</p>
				<div className="flex flex-wrap gap-2">
					<input
						type="number"
						required
						step={1}
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						placeholder="Сумма, ₽ (можно −)"
						className={`${inputCls} w-40`}
					/>
					<input
						type="text"
						maxLength={120}
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						placeholder="Комментарий (видит пользователь)"
						className={`${inputCls} min-w-0 flex-1`}
					/>
					<button
						type="submit"
						disabled={busy !== null || !amount}
						className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{busy === "balance" ? (
							<Loader2 className="size-4 animate-spin" aria-hidden />
						) : null}
						Применить
					</button>
				</div>
			</form>

			{!isSelf ? (
				<div className="space-y-2 border-t border-stone-800/60 pt-4">
					<p className="flex items-center gap-1.5 text-sm text-stone-400">
						<Ban className="size-4" />
						{banned ? "Пользователь заблокирован" : "Блокировка"}
					</p>
					<div className="flex flex-wrap gap-2">
						{!banned ? (
							<input
								type="text"
								maxLength={200}
								value={banReason}
								onChange={(e) => setBanReason(e.target.value)}
								placeholder="Причина (необязательно)"
								className={`${inputCls} min-w-0 flex-1`}
							/>
						) : null}
						<button
							type="button"
							onClick={handleBanToggle}
							disabled={busy !== null}
							className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
								banned
									? "border border-stone-700 text-stone-200 hover:bg-stone-800"
									: "bg-red-500/90 text-stone-950 hover:bg-red-400"
							}`}
						>
							{busy === "ban" ? (
								<Loader2 className="size-4 animate-spin" aria-hidden />
							) : null}
							{banned ? "Разбанить" : "Забанить"}
						</button>
					</div>
				</div>
			) : null}

			{error ? (
				<p className="text-sm text-red-400" role="alert">
					{error}
				</p>
			) : null}
			{success ? <p className="text-sm text-emerald-400">{success}</p> : null}
		</div>
	);
}
