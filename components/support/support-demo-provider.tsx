"use client";

import { INITIAL_TICKETS } from "@/lib/support/mock-data";
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

type SupportDemoContextValue = {
	tickets: SupportTicket[];
	viewedIds: ReadonlySet<string>;
	hasAttention: boolean;
	getTicket: (id: string) => SupportTicket | undefined;
	markTicketViewed: (id: string) => void;
	createTicket: (subject: string, body: string) => string;
	replyToTicket: (id: string, body: string) => void;
	closeTicket: (id: string) => void;
};

const SupportDemoContext = createContext<SupportDemoContextValue | null>(null);

let ticketCounter = 2000;
let messageCounter = 5000;

function nextTicketId() {
	return String(++ticketCounter);
}

function nextMessageId() {
	return `msg-${++messageCounter}`;
}

function sortTickets(list: SupportTicket[]): SupportTicket[] {
	return [...list].sort(
		(a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
	);
}

type SupportDemoProviderProps = {
	children: ReactNode;
};

export function SupportDemoProvider({ children }: SupportDemoProviderProps) {
	const [tickets, setTickets] = useState<SupportTicket[]>(
		sortTickets(INITIAL_TICKETS),
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

	const createTicket = useCallback((subject: string, body: string) => {
		const now = new Date().toISOString();
		const id = nextTicketId();
		const ticket: SupportTicket = {
			id,
			subject: subject.trim(),
			status: "open",
			createdAt: now,
			updatedAt: now,
			messages: [
				{
					id: nextMessageId(),
					author: "user",
					body: body.trim(),
					createdAt: now,
				},
			],
		};
		setTickets((prev) => sortTickets([ticket, ...prev]));
		return id;
	}, []);

	const replyToTicket = useCallback((id: string, body: string) => {
		const trimmed = body.trim();
		if (!trimmed) return;
		const now = new Date().toISOString();
		setTickets((prev) =>
			sortTickets(
				prev.map((t) => {
					if (t.id !== id || t.status === "closed") return t;
					return {
						...t,
						status: "open" as const,
						updatedAt: now,
						messages: [
							...t.messages,
							{
								id: nextMessageId(),
								author: "user" as const,
								body: trimmed,
								createdAt: now,
							},
						],
					};
				}),
			),
		);
	}, []);

	const closeTicket = useCallback((id: string) => {
		const now = new Date().toISOString();
		setTickets((prev) =>
			sortTickets(
				prev.map((t) =>
					t.id === id
						? { ...t, status: "closed" as const, updatedAt: now }
						: t,
				),
			),
		);
	}, []);

	const hasAttention = useMemo(
		() => hasAttentionTickets(tickets, viewedIds),
		[tickets, viewedIds],
	);

	const value: SupportDemoContextValue = {
		tickets,
		viewedIds,
		hasAttention,
		getTicket,
		markTicketViewed,
		createTicket,
		replyToTicket,
		closeTicket,
	};

	return (
		<SupportDemoContext.Provider value={value}>
			{children}
		</SupportDemoContext.Provider>
	);
}

export function useSupportDemo() {
	const ctx = useContext(SupportDemoContext);
	if (!ctx) {
		throw new Error("useSupportDemo must be used within SupportDemoProvider");
	}
	return ctx;
}
