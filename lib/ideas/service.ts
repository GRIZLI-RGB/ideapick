import "server-only";

import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/drizzle";
import { idea } from "@/drizzle/schema";
import type { Idea } from "@/lib/ideas/types";
import {
	IDEA_DESCRIPTION_MAX,
	IDEA_DESCRIPTION_MIN,
	IDEA_TITLE_MAX,
	IDEA_TITLE_MIN,
} from "@/lib/ideas/validation";

export type IdeaSource = "manual" | "catalog" | "anamnesis";

export class IdeaValidationError extends Error {}

export function toClientIdea(row: typeof idea.$inferSelect): Idea {
	return {
		id: row.id,
		title: row.title,
		description: row.description,
		score: row.score,
		createdAt: row.createdAt.toISOString(),
		hasAnalysis: row.hasAnalysis,
		archived: row.archivedAt !== null,
	};
}

export async function listIdeas(userId: string): Promise<Idea[]> {
	const rows = await db
		.select()
		.from(idea)
		.where(eq(idea.userId, userId))
		.orderBy(desc(idea.createdAt));

	return rows.map(toClientIdea);
}

/**
 * Создаёт идею пользователя. Анализ не запускается — score/hasAnalysis пустые.
 * Бросает {@link IdeaValidationError} при некорректных полях.
 */
export async function createIdea({
	userId,
	title,
	description,
	source = "manual",
}: {
	userId: string;
	title: string;
	description: string;
	source?: IdeaSource;
}): Promise<Idea> {
	const cleanTitle = title.trim();
	const cleanDescription = description.trim();

	if (cleanTitle.length < IDEA_TITLE_MIN) {
		throw new IdeaValidationError(
			`Название должно быть не короче ${IDEA_TITLE_MIN} символов`,
		);
	}
	if (cleanTitle.length > IDEA_TITLE_MAX) {
		throw new IdeaValidationError(
			`Название должно быть не длиннее ${IDEA_TITLE_MAX} символов`,
		);
	}
	if (cleanDescription.length < IDEA_DESCRIPTION_MIN) {
		throw new IdeaValidationError(
			`Описание должно быть не короче ${IDEA_DESCRIPTION_MIN} символов`,
		);
	}
	if (cleanDescription.length > IDEA_DESCRIPTION_MAX) {
		throw new IdeaValidationError(
			`Описание должно быть не длиннее ${IDEA_DESCRIPTION_MAX} символов`,
		);
	}

	const [row] = await db
		.insert(idea)
		.values({
			id: randomUUID(),
			userId,
			title: cleanTitle,
			description: cleanDescription,
			source,
		})
		.returning();

	return toClientIdea(row);
}

/** Удаляет идею пользователя. Возвращает true, если запись существовала. */
export async function deleteIdea({
	userId,
	ideaId,
}: {
	userId: string;
	ideaId: string;
}): Promise<boolean> {
	const deleted = await db
		.delete(idea)
		.where(and(eq(idea.id, ideaId), eq(idea.userId, userId)))
		.returning({ id: idea.id });

	return deleted.length > 0;
}

/**
 * Переносит идею в архив или возвращает в активные.
 * Возвращает обновлённую идею или null, если запись не найдена.
 */
export async function setIdeaArchived({
	userId,
	ideaId,
	archived,
}: {
	userId: string;
	ideaId: string;
	archived: boolean;
}): Promise<Idea | null> {
	const [row] = await db
		.update(idea)
		.set({ archivedAt: archived ? new Date() : null, updatedAt: new Date() })
		.where(and(eq(idea.id, ideaId), eq(idea.userId, userId)))
		.returning();

	return row ? toClientIdea(row) : null;
}

/** Получает одну идею пользователя (или null). */
export async function getIdea({
	userId,
	ideaId,
}: {
	userId: string;
	ideaId: string;
}): Promise<Idea | null> {
	const [row] = await db
		.select()
		.from(idea)
		.where(and(eq(idea.id, ideaId), eq(idea.userId, userId)))
		.limit(1);

	return row ? toClientIdea(row) : null;
}
