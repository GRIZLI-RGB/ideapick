"use client";

import { TicketStatusBadge } from "@/components/support/ticket-status-badge";
import { ticketCardAccent } from "@/lib/support/constants";
import { ticketNeedsAttention, ticketPreview } from "@/lib/support/utils";
import type { SupportTicket } from "@/lib/support/types";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

function formatUpdated(iso: string) {
	return new Intl.DateTimeFormat("ru-RU", {
		day: "numeric",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(iso));
}

type TicketCardItemProps = {
	ticket: SupportTicket;
	viewedIds: ReadonlySet<string>;
};

export function TicketCardItem({ ticket, viewedIds }: TicketCardItemProps) {
	const accent = ticketCardAccent(
		ticket.status,
		ticketNeedsAttention(ticket, viewedIds),
	);
	const needsAttention = ticketNeedsAttention(ticket, viewedIds);

	return (
		<li className="h-full">
			<Link
				href={`/app/support/${ticket.id}`}
				className={`group flex h-full cursor-pointer flex-col rounded-2xl border px-4 py-3.5 transition-colors ${accent}`}
			>
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-xs tabular-nums text-stone-500">#{ticket.id}</span>
					<TicketStatusBadge status={ticket.status} showPulse={needsAttention} />
				</div>
				<p className="mt-1.5 line-clamp-2 flex-1 font-medium text-stone-100 transition-colors group-hover:text-stone-50">
					{ticket.subject}
				</p>
				<p className="mt-1 line-clamp-2 text-sm text-stone-500">
					{ticketPreview(ticket)}
				</p>
				<div className="mt-3 flex items-center justify-between gap-2">
					<p className="text-xs text-stone-600">
						{formatUpdated(ticket.updatedAt)}
					</p>
					<ChevronRight className="size-4 shrink-0 text-stone-600 transition group-hover:text-stone-400" />
				</div>
			</Link>
		</li>
	);
}
