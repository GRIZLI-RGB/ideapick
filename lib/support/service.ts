import "server-only";

import { randomUUID } from "node:crypto";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/drizzle";
import { supportMessage, supportTicket, user } from "@/drizzle/schema";
import type {
	AdminSupportTicket,
	SupportTicket,
	SupportTicketStatus,
	TicketAuthor,
	TicketMessage,
} from "@/lib/support/types";

export class SupportValidationError extends Error {}

const SUBJECT_MAX = 120;
const BODY_MAX = 4000;

function validateSubject(subject: string): string {
	const trimmed = subject.trim();
	if (trimmed.length < 3 || trimmed.length > SUBJECT_MAX) {
		throw new SupportValidationError(
			`Тема должна быть от 3 до ${SUBJECT_MAX} символов`,
		);
	}
	return trimmed;
}

function validateBody(body: string): string {
	const trimmed = body.trim();
	if (trimmed.length === 0 || trimmed.length > BODY_MAX) {
		throw new SupportValidationError(
			`Сообщение должно быть от 1 до ${BODY_MAX} символов`,
		);
	}
	return trimmed;
}

function toClientMessage(
	row: typeof supportMessage.$inferSelect,
): TicketMessage {
	return {
		id: row.id,
		author: row.author as TicketAuthor,
		body: row.body,
		createdAt: row.createdAt.toISOString(),
	};
}

function toClientTicket(
	row: typeof supportTicket.$inferSelect,
	messages: TicketMessage[],
): SupportTicket {
	return {
		id: row.id,
		number: row.number,
		subject: row.subject,
		status: row.status as SupportTicketStatus,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
		messages,
	};
}

/** Загружает сообщения для набора тикетов одной выборкой. */
async function loadMessages(
	ticketIds: string[],
): Promise<Map<string, TicketMessage[]>> {
	const map = new Map<string, TicketMessage[]>();
	if (ticketIds.length === 0) return map;

	const rows = await db
		.select()
		.from(supportMessage)
		.where(inArray(supportMessage.ticketId, ticketIds))
		.orderBy(supportMessage.createdAt);

	for (const row of rows) {
		const list = map.get(row.ticketId) ?? [];
		list.push(toClientMessage(row));
		map.set(row.ticketId, list);
	}
	return map;
}

export async function listTickets(userId: string): Promise<SupportTicket[]> {
	const rows = await db
		.select()
		.from(supportTicket)
		.where(eq(supportTicket.userId, userId))
		.orderBy(desc(supportTicket.updatedAt));

	const messages = await loadMessages(rows.map((r) => r.id));
	return rows.map((row) => toClientTicket(row, messages.get(row.id) ?? []));
}

export async function createTicket({
	userId,
	subject,
	body,
}: {
	userId: string;
	subject: string;
	body: string;
}): Promise<SupportTicket> {
	const safeSubject = validateSubject(subject);
	const safeBody = validateBody(body);

	const ticketId = randomUUID();

	const created = await db.transaction(async (tx) => {
		const [ticket] = await tx
			.insert(supportTicket)
			.values({
				id: ticketId,
				userId,
				subject: safeSubject,
				status: "open",
			})
			.returning();

		const [message] = await tx
			.insert(supportMessage)
			.values({
				id: randomUUID(),
				ticketId,
				author: "user",
				body: safeBody,
			})
			.returning();

		return { ticket, message };
	});

	return toClientTicket(created.ticket, [toClientMessage(created.message)]);
}

/**
 * Ответ в тикете. Пользователь может писать только в свои незакрытые тикеты;
 * для админа (`author: "support"`) проверка владельца не выполняется.
 */
export async function addMessage({
	ticketId,
	author,
	body,
	userId,
}: {
	ticketId: string;
	author: TicketAuthor;
	body: string;
	/** Обязателен для author="user" — проверка владельца тикета */
	userId?: string;
}): Promise<SupportTicket> {
	const safeBody = validateBody(body);

	const ownership =
		author === "user" && userId
			? and(eq(supportTicket.id, ticketId), eq(supportTicket.userId, userId))
			: eq(supportTicket.id, ticketId);

	const updated = await db.transaction(async (tx) => {
		const [ticket] = await tx
			.select()
			.from(supportTicket)
			.where(ownership)
			.for("update");

		if (!ticket) {
			throw new SupportValidationError("Обращение не найдено");
		}
		if (ticket.status === "closed") {
			throw new SupportValidationError("Обращение закрыто");
		}

		await tx.insert(supportMessage).values({
			id: randomUUID(),
			ticketId,
			author,
			body: safeBody,
		});

		// Ответ поддержки → «есть ответ», ответ пользователя → «открыт».
		const nextStatus = author === "support" ? "answered" : "open";
		const [fresh] = await tx
			.update(supportTicket)
			.set({ status: nextStatus, updatedAt: new Date() })
			.where(eq(supportTicket.id, ticketId))
			.returning();

		return fresh;
	});

	const messages = await loadMessages([ticketId]);
	return toClientTicket(updated, messages.get(ticketId) ?? []);
}

export async function setTicketStatus({
	ticketId,
	status,
	userId,
}: {
	ticketId: string;
	status: SupportTicketStatus;
	/** Если задан — меняем только свой тикет (пользовательский сценарий) */
	userId?: string;
}): Promise<SupportTicket> {
	const where = userId
		? and(eq(supportTicket.id, ticketId), eq(supportTicket.userId, userId))
		: eq(supportTicket.id, ticketId);

	const [updated] = await db
		.update(supportTicket)
		.set({ status, updatedAt: new Date() })
		.where(where)
		.returning();

	if (!updated) {
		throw new SupportValidationError("Обращение не найдено");
	}

	const messages = await loadMessages([ticketId]);
	return toClientTicket(updated, messages.get(ticketId) ?? []);
}

// ---------------------------------------------------------------------------
// Админ-панель
// ---------------------------------------------------------------------------

export async function adminListTickets(
	statusFilter?: SupportTicketStatus,
): Promise<AdminSupportTicket[]> {
	const where = statusFilter
		? eq(supportTicket.status, statusFilter)
		: undefined;

	const rows = await db
		.select({ ticket: supportTicket, author: user })
		.from(supportTicket)
		.innerJoin(user, eq(supportTicket.userId, user.id))
		.where(where)
		.orderBy(desc(supportTicket.updatedAt));

	const messages = await loadMessages(rows.map((r) => r.ticket.id));
	return rows.map(({ ticket, author }) => ({
		...toClientTicket(ticket, messages.get(ticket.id) ?? []),
		user: { id: author.id, name: author.name, email: author.email },
	}));
}

export async function adminGetTicket(
	ticketId: string,
): Promise<AdminSupportTicket | null> {
	const [row] = await db
		.select({ ticket: supportTicket, author: user })
		.from(supportTicket)
		.innerJoin(user, eq(supportTicket.userId, user.id))
		.where(eq(supportTicket.id, ticketId))
		.limit(1);

	if (!row) return null;

	const messages = await loadMessages([row.ticket.id]);
	return {
		...toClientTicket(row.ticket, messages.get(row.ticket.id) ?? []),
		user: { id: row.author.id, name: row.author.name, email: row.author.email },
	};
}
