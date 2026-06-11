"use client";

import { TicketStatusBadge } from "@/components/support/ticket-status-badge";
import type {
	AdminSupportTicket,
	SupportTicketStatus,
	TicketMessage,
} from "@/lib/support/types";
import { Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function formatMessageTime(iso: string) {
	return new Intl.DateTimeFormat("ru-RU", {
		day: "numeric",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(iso));
}

/** Зеркально пользовательскому виду: справа — поддержка (мы), слева — пользователь. */
function MessageBubble({ message }: { message: TicketMessage }) {
	const isSupport = message.author === "support";

	return (
		<div className={`flex ${isSupport ? "justify-end" : "justify-start"}`}>
			<div
				className={`max-w-[min(100%,24rem)] rounded-2xl px-3.5 py-2.5 sm:max-w-lg ${
					isSupport
						? "rounded-br-md bg-amber-500/15 text-stone-100 ring-1 ring-amber-500/20"
						: "rounded-bl-md border border-stone-700/80 bg-stone-900/80 text-stone-200"
				}`}
			>
				<p className="text-sm leading-relaxed whitespace-pre-wrap">
					{message.body}
				</p>
				<p
					className={`mt-1.5 text-[10px] tabular-nums ${
						isSupport ? "text-stone-500" : "text-stone-600"
					}`}
				>
					{isSupport ? "Поддержка" : "Пользователь"} ·{" "}
					{formatMessageTime(message.createdAt)}
				</p>
			</div>
		</div>
	);
}

const STATUS_ACTIONS: { status: SupportTicketStatus; label: string }[] = [
	{ status: "open", label: "Открыт" },
	{ status: "in_progress", label: "В работе" },
	{ status: "closed", label: "Закрыт" },
];

export function AdminTicketPanel({ ticket }: { ticket: AdminSupportTicket }) {
	const router = useRouter();
	const [reply, setReply] = useState("");
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function request(url: string, init: RequestInit) {
		setBusy(true);
		setError(null);
		try {
			const res = await fetch(url, {
				headers: { "Content-Type": "application/json" },
				...init,
			});
			if (!res.ok) {
				const data = await res.json().catch(() => null);
				throw new Error(
					data && typeof data.error === "string"
						? data.error
						: "Что-то пошло не так",
				);
			}
			router.refresh();
			return true;
		} catch (err) {
			setError(err instanceof Error ? err.message : "Что-то пошло не так");
			return false;
		} finally {
			setBusy(false);
		}
	}

	async function handleReply(e: React.FormEvent) {
		e.preventDefault();
		if (!reply.trim() || busy) return;
		const ok = await request(`/api/admin/support/${ticket.id}/messages`, {
			method: "POST",
			body: JSON.stringify({ body: reply }),
		});
		if (ok) setReply("");
	}

	async function handleStatus(status: SupportTicketStatus) {
		if (busy || ticket.status === status) return;
		await request(`/api/admin/support/${ticket.id}`, {
			method: "PATCH",
			body: JSON.stringify({ status }),
		});
	}

	const isClosed = ticket.status === "closed";

	return (
		<div className="space-y-4">
			<div>
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-xs tabular-nums text-stone-500">
						#{ticket.number}
					</span>
					<TicketStatusBadge status={ticket.status} />
					<Link
						href={`/admin/users/${ticket.user.id}`}
						className="text-xs text-stone-500 transition hover:text-amber-300"
					>
						{ticket.user.email}
					</Link>
				</div>
				<h1 className="mt-1 text-xl font-bold tracking-tight text-stone-50 sm:text-2xl">
					{ticket.subject}
				</h1>
			</div>

			<div className="flex flex-wrap items-center gap-2">
				<span className="text-xs text-stone-500">Статус:</span>
				{STATUS_ACTIONS.map(({ status, label }) => (
					<button
						key={status}
						type="button"
						disabled={busy || ticket.status === status}
						onClick={() => handleStatus(status)}
						className={`cursor-pointer rounded-lg border px-3 py-1 text-xs font-medium transition disabled:cursor-default ${
							ticket.status === status
								? "border-amber-500/40 bg-amber-500/10 text-amber-200"
								: "border-stone-700/80 text-stone-400 hover:border-stone-600 hover:bg-stone-800/50 hover:text-stone-200"
						}`}
					>
						{label}
					</button>
				))}
			</div>

			<div className="flex min-h-0 flex-col rounded-3xl border border-stone-800/50 bg-stone-900/30">
				<div className="no-scrollbar flex min-h-[280px] max-h-[min(60vh,560px)] flex-col gap-3 overflow-y-auto p-4 sm:p-6">
					{ticket.messages.map((msg) => (
						<MessageBubble key={msg.id} message={msg} />
					))}
				</div>

				{isClosed ? (
					<p className="shrink-0 border-t border-stone-800/60 px-4 py-3 text-center text-xs text-stone-500">
						Обращение закрыто — смените статус, чтобы ответить
					</p>
				) : (
					<form
						onSubmit={handleReply}
						className="shrink-0 border-t border-stone-800/60 p-3 sm:p-4"
					>
						<label htmlFor="admin-reply" className="sr-only">
							Ответ поддержки
						</label>
						<textarea
							id="admin-reply"
							rows={3}
							value={reply}
							onChange={(e) => setReply(e.target.value)}
							placeholder="Ответ пользователю…"
							className="w-full resize-none rounded-xl border border-stone-700 bg-stone-950/60 px-3 py-2.5 text-sm text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20"
						/>
						{error ? (
							<p className="mt-2 text-sm text-red-400" role="alert">
								{error}
							</p>
						) : null}
						<div className="mt-2 flex justify-end">
							<button
								type="submit"
								disabled={!reply.trim() || busy}
								className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{busy ? (
									<Loader2 className="size-4 animate-spin" aria-hidden />
								) : (
									<Send className="size-4" aria-hidden />
								)}
								Ответить
							</button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
