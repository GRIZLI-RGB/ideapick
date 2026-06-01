"use client";

import { TicketStatusBadge } from "@/components/support/ticket-status-badge";
import { useSupportDemo } from "@/components/support/support-demo-provider";
import type { SupportTicket, TicketMessage } from "@/lib/support/types";
import { ticketNeedsAttention } from "@/lib/support/utils";
import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function formatMessageTime(iso: string) {
	return new Intl.DateTimeFormat("ru-RU", {
		day: "numeric",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(iso));
}

function MessageBubble({ message }: { message: TicketMessage }) {
	const isUser = message.author === "user";

	return (
		<div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
			<div
				className={`max-w-[min(100%,24rem)] rounded-2xl px-3.5 py-2.5 sm:max-w-lg ${
					isUser
						? "rounded-br-md bg-amber-500/15 text-stone-100 ring-1 ring-amber-500/20"
						: "rounded-bl-md border border-stone-700/80 bg-stone-900/80 text-stone-200"
				}`}
			>
				<p className="text-sm leading-relaxed whitespace-pre-wrap">
					{message.body}
				</p>
				<p
					className={`mt-1.5 text-[10px] tabular-nums ${
						isUser ? "text-stone-500" : "text-stone-600"
					}`}
				>
					{isUser ? "Вы" : "Поддержка"} ·{" "}
					{formatMessageTime(message.createdAt)}
				</p>
			</div>
		</div>
	);
}

type TicketThreadPanelProps = {
	ticket: SupportTicket;
	compact?: boolean;
	onCloseTicket?: () => void;
};

export function TicketThreadPanel({
	ticket,
	compact = false,
	onCloseTicket,
}: TicketThreadPanelProps) {
	const router = useRouter();
	const { markTicketViewed, replyToTicket, closeTicket, viewedIds } =
		useSupportDemo();
	const [reply, setReply] = useState("");
	const [sending, setSending] = useState(false);

	useEffect(() => {
		markTicketViewed(ticket.id);
	}, [ticket.id, markTicketViewed]);

	const isClosed = ticket.status === "closed";
	const needsAttention = ticketNeedsAttention(ticket, viewedIds);

	async function handleReply(e: React.FormEvent) {
		e.preventDefault();
		if (!reply.trim() || sending || isClosed) return;
		setSending(true);
		await new Promise((r) => setTimeout(r, 400));
		replyToTicket(ticket.id, reply);
		setReply("");
		setSending(false);
	}

	function handleClose() {
		closeTicket(ticket.id);
		if (onCloseTicket) onCloseTicket();
		else router.push("/app/support");
	}

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className={`shrink-0 ${compact ? "px-4 pt-4 pb-2" : "mb-4"}`}>
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-xs tabular-nums text-stone-500">
						#{ticket.id}
					</span>
					<TicketStatusBadge status={ticket.status} showPulse={needsAttention} />
				</div>
				<h2
					className={`font-bold tracking-tight text-stone-50 ${
						compact ? "mt-1 text-lg" : "mt-1 text-xl sm:text-2xl"
					}`}
				>
					{ticket.subject}
				</h2>
			</div>

			<div
				className={`flex min-h-0 flex-1 flex-col border-stone-800/50 bg-stone-900/30 ${
					compact
						? "mx-0 border-0"
						: "rounded-3xl border"
				}`}
			>
				<div
					className={`flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto ${
						compact
							? "max-h-[min(55vh,480px)] px-4 py-3"
							: "min-h-[280px] max-h-[min(60vh,560px)] p-4 sm:p-6"
					}`}
				>
					{ticket.messages.map((msg) => (
						<MessageBubble key={msg.id} message={msg} />
					))}
				</div>

				{isClosed ? (
					<p className="shrink-0 border-t border-stone-800/60 px-4 py-3 text-center text-xs text-stone-500">
						Обращение закрыто
					</p>
				) : (
					<form
						onSubmit={handleReply}
						className="shrink-0 border-t border-stone-800/60 p-3 sm:p-4"
					>
						<label htmlFor={`ticket-reply-${ticket.id}`} className="sr-only">
							Ваш ответ
						</label>
						<textarea
							id={`ticket-reply-${ticket.id}`}
							rows={compact ? 2 : 3}
							value={reply}
							onChange={(e) => setReply(e.target.value)}
							placeholder="Напишите ответ…"
							className="w-full resize-none rounded-xl border border-stone-700 bg-stone-950/60 px-3 py-2.5 text-sm text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20"
						/>
						<div className="mt-2 flex flex-wrap items-center justify-between gap-2">
							<button
								type="button"
								onClick={handleClose}
								className="cursor-pointer px-1 text-xs text-stone-500 transition hover:text-stone-300"
							>
								Закрыть обращение
							</button>
							<button
								type="submit"
								disabled={!reply.trim() || sending}
								className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{sending ? (
									<Loader2 className="size-4 animate-spin" aria-hidden />
								) : (
									<Send className="size-4" aria-hidden />
								)}
								Отправить
							</button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
