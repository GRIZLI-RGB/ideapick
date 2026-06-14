"use client";

import type { SupportTicket } from "@/lib/support/types";
import { hasAttentionTickets } from "@/lib/support/utils";
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from "react";

type SupportContextValue = {
	tickets: SupportTicket[];
	viewedIds: ReadonlySet<string>;
	hasAttention: boolean;
	getTicket: (id: string) => SupportTicket | undefined;
	markTicketViewed: (id: string) => void;
	createTicket: (subject: string, body: string) => Promise<string>;
	replyToTicket: (id: string, body: string) => Promise<void>;
	closeTicket: (id: string) => Promise<void>;
};

const SupportContext = createContext<SupportContextValue | null>(null);

function sortTickets(list: SupportTicket[]): SupportTicket[] {
	return [...list].sort(
		(a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
	);
}

async function requestJson<T>(url: string, init: RequestInit): Promise<T> {
	const res = await fetch(url, {
		headers: { "Content-Type": "application/json" },
		...init,
	});
	const data = await res.json().catch(() => null);
	if (!res.ok) {
		const message =
			data && typeof data.error === "string"
				? data.error
				: "Что-то пошло не так. Попробуйте позже.";
		throw new Error(message);
	}
	return data as T;
}

type SupportProviderProps = {
	children: ReactNode;
	initialTickets: SupportTicket[];
};

export function SupportProvider({
	children,
	initialTickets,
}: SupportProviderProps) {
	const [tickets, setTickets] = useState<SupportTicket[]>(() =>
		sortTickets(initialTickets),
	);
	const [viewedIds, setViewedIds] = useState<Set<string>>(() => new Set());

	const markTicketViewed = useCallback((id: string) => {
		setViewedIds((prev) => {
			if (prev.has(id)) return prev;
			const next = new Set(prev);
			next.add(id);
			return next;
		});
	}, []);

	const getTicket = useCallback(
		(id: string) => tickets.find((t) => t.id === id),
		[tickets],
	);

	const upsertTicket = useCallback((ticket: SupportTicket) => {
		setTickets((prev) =>
			sortTickets([ticket, ...prev.filter((t) => t.id !== ticket.id)]),
		);
	}, []);

	const createTicket = useCallback(
		async (subject: string, body: string) => {
			const { ticket } = await requestJson<{ ticket: SupportTicket }>(
				"/api/support",
				{ method: "POST", body: JSON.stringify({ subject, body }) },
			);
			upsertTicket(ticket);
			return ticket.id;
		},
		[upsertTicket],
	);

	const replyToTicket = useCallback(
		async (id: string, body: string) => {
			const { ticket } = await requestJson<{ ticket: SupportTicket }>(
				`/api/support/${id}/messages`,
				{ method: "POST", body: JSON.stringify({ body }) },
			);
			upsertTicket(ticket);
		},
		[upsertTicket],
	);

	const closeTicket = useCallback(
		async (id: string) => {
			const { ticket } = await requestJson<{ ticket: SupportTicket }>(
				`/api/support/${id}`,
				{ method: "PATCH", body: JSON.stringify({ status: "closed" }) },
			);
			upsertTicket(ticket);
		},
		[upsertTicket],
	);

	const hasAttention = useMemo(
		() => hasAttentionTickets(tickets, viewedIds),
		[tickets, viewedIds],
	);

	const value = useMemo<SupportContextValue>(
		() => ({
			tickets,
			viewedIds,
			hasAttention,
			getTicket,
			markTicketViewed,
			createTicket,
			replyToTicket,
			closeTicket,
		}),
		[
			tickets,
			viewedIds,
			hasAttention,
			getTicket,
			markTicketViewed,
			createTicket,
			replyToTicket,
			closeTicket,
		],
	);

	return (
		<SupportContext.Provider value={value}>{children}</SupportContext.Provider>
	);
}

export function useSupport() {
	const ctx = useContext(SupportContext);
	if (!ctx) {
		throw new Error("useSupport must be used within SupportProvider");
	}
	return ctx;
}
