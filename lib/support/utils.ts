import type { SupportTicket, TicketMessage } from "@/lib/support/types";

export function lastMessage(ticket: SupportTicket): TicketMessage | undefined {
	return ticket.messages.at(-1);
}

export function ticketPreview(ticket: SupportTicket, maxLen = 72): string {
	const last = lastMessage(ticket);
	if (!last) return "";
	const text = last.body.replace(/\s+/g, " ").trim();
	return text.length <= maxLen ? text : `${text.slice(0, maxLen)}…`;
}

/** Нужно внимание пользователя: не закрыт и последнее сообщение от поддержки */
export function ticketNeedsAttention(
	ticket: SupportTicket,
	viewedIds?: ReadonlySet<string>,
): boolean {
	if (viewedIds?.has(ticket.id)) return false;
	if (ticket.status === "closed") return false;
	const last = lastMessage(ticket);
	return last?.author === "support";
}

export function hasAttentionTickets(
	tickets: SupportTicket[],
	viewedIds?: ReadonlySet<string>,
): boolean {
	return tickets.some((t) => ticketNeedsAttention(t, viewedIds));
}

export function isTicketOpen(ticket: SupportTicket): boolean {
	return ticket.status !== "closed";
}
