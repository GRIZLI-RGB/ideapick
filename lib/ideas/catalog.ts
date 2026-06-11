import "server-only";

import { randomUUID } from "node:crypto";
import { and, count, desc, eq, gte, isNull, sql } from "drizzle-orm";
import { db } from "@/drizzle";
import { catalogIdea, idea, user } from "@/drizzle/schema";
import { toClientIdea } from "@/lib/ideas/service";
import type { CatalogStatus, Idea } from "@/lib/ideas/types";
import {
	IDEA_DESCRIPTION_MAX,
	IDEA_DESCRIPTION_MIN,
	IDEA_TITLE_MAX,
	IDEA_TITLE_MIN,
} from "@/lib/ideas/validation";

/** Сегодняшняя бесплатная идея уже получена. */
export class CatalogLimitError extends Error {}
/** Свободных идей в пуле не осталось. */
export class CatalogEmptyError extends Error {}
export class CatalogValidationError extends Error {}

const MSK_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Начало текущих суток по Москве (UTC+3, без перехода на летнее время) —
 * дневной лимит каталога «обнуляется» в 00:00 МСК для всех пользователей.
 */
export function startOfTodayMsk(now = Date.now()): Date {
	return new Date(
		Math.floor((now + MSK_OFFSET_MS) / DAY_MS) * DAY_MS - MSK_OFFSET_MS,
	);
}

export type { CatalogStatus };

function usedTodayCondition(userId: string) {
	return and(
		eq(catalogIdea.issuedToUserId, userId),
		gte(catalogIdea.issuedAt, startOfTodayMsk()),
	);
}

export async function getCatalogStatus(userId: string): Promise<CatalogStatus> {
	const [[used], [left]] = await Promise.all([
		db
			.select({ value: count() })
			.from(catalogIdea)
			.where(usedTodayCondition(userId)),
		db
			.select({ value: count() })
			.from(catalogIdea)
			.where(isNull(catalogIdea.issuedAt)),
	]);

	return { usedToday: used.value > 0, poolLeft: left.value };
}

/**
 * Выдаёт случайную невыданную идею из каталога: помечает её выданной
 * (глобально, без повторов для всех пользователей) и создаёт идею
 * пользователя с source='catalog'. Лимит — одна идея в сутки (МСК).
 */
export async function claimCatalogIdea(userId: string): Promise<Idea> {
	return db.transaction(async (tx) => {
		const [used] = await tx
			.select({ value: count() })
			.from(catalogIdea)
			.where(usedTodayCondition(userId));

		if (used.value > 0) {
			throw new CatalogLimitError(
				"Сегодняшняя идея уже получена — новая будет доступна завтра",
			);
		}

		// SKIP LOCKED: параллельные выдачи не подерутся за одну строку.
		const [picked] = await tx
			.select({
				id: catalogIdea.id,
				title: catalogIdea.title,
				description: catalogIdea.description,
			})
			.from(catalogIdea)
			.where(isNull(catalogIdea.issuedAt))
			.orderBy(sql`random()`)
			.limit(1)
			.for("update", { skipLocked: true });

		if (!picked) {
			throw new CatalogEmptyError(
				"Свободные идеи в каталоге закончились — пул скоро пополнится",
			);
		}

		await tx
			.update(catalogIdea)
			.set({ issuedToUserId: userId, issuedAt: new Date() })
			.where(eq(catalogIdea.id, picked.id));

		const [row] = await tx
			.insert(idea)
			.values({
				id: randomUUID(),
				userId,
				title: picked.title,
				description: picked.description,
				source: "catalog",
			})
			.returning();

		return toClientIdea(row);
	});
}

// ---------------------------------------------------------------------------
// Админ: управление пулом
// ---------------------------------------------------------------------------

export const CATALOG_IMPORT_MAX = 200;

export type CatalogAdminRow = {
	id: string;
	title: string;
	description: string;
	issuedAt: string | null;
	issuedToEmail: string | null;
	createdAt: string;
};

export type CatalogStats = {
	total: number;
	available: number;
	issued: number;
};

export async function getCatalogStats(): Promise<CatalogStats> {
	const [[total], [available]] = await Promise.all([
		db.select({ value: count() }).from(catalogIdea),
		db
			.select({ value: count() })
			.from(catalogIdea)
			.where(isNull(catalogIdea.issuedAt)),
	]);

	return {
		total: total.value,
		available: available.value,
		issued: total.value - available.value,
	};
}

export async function listCatalogIdeas({
	page,
	pageSize,
}: {
	page: number;
	pageSize: number;
}): Promise<{ items: CatalogAdminRow[]; total: number }> {
	const [rows, [totalRow]] = await Promise.all([
		db
			.select({ row: catalogIdea, issuedToEmail: user.email })
			.from(catalogIdea)
			.leftJoin(user, eq(catalogIdea.issuedToUserId, user.id))
			// Сначала свободные, внутри групп — новые сверху.
			.orderBy(
				sql`${catalogIdea.issuedAt} IS NOT NULL`,
				desc(catalogIdea.createdAt),
			)
			.limit(pageSize)
			.offset((page - 1) * pageSize),
		db.select({ value: count() }).from(catalogIdea),
	]);

	return {
		items: rows.map(({ row, issuedToEmail }) => ({
			id: row.id,
			title: row.title,
			description: row.description,
			issuedAt: row.issuedAt?.toISOString() ?? null,
			issuedToEmail,
			createdAt: row.createdAt.toISOString(),
		})),
		total: totalRow.value,
	};
}

/**
 * Пополняет пул. Дубликаты по названию (в т.ч. внутри запроса) молча
 * пропускаются — повторный импорт того же JSON безопасен.
 */
export async function addCatalogIdeas(
	items: { title: string; description: string }[],
): Promise<{ added: number; skipped: number }> {
	if (items.length === 0) {
		throw new CatalogValidationError("Список идей пуст");
	}
	if (items.length > CATALOG_IMPORT_MAX) {
		throw new CatalogValidationError(
			`За один импорт можно добавить не более ${CATALOG_IMPORT_MAX} идей`,
		);
	}

	const seen = new Set<string>();
	const values: (typeof catalogIdea.$inferInsert)[] = [];

	for (const [i, item] of items.entries()) {
		const title = item.title.trim();
		const description = item.description.trim();
		const at = `(идея №${i + 1})`;

		if (title.length < IDEA_TITLE_MIN || title.length > IDEA_TITLE_MAX) {
			throw new CatalogValidationError(
				`Название — от ${IDEA_TITLE_MIN} до ${IDEA_TITLE_MAX} символов ${at}`,
			);
		}
		if (
			description.length < IDEA_DESCRIPTION_MIN ||
			description.length > IDEA_DESCRIPTION_MAX
		) {
			throw new CatalogValidationError(
				`Описание — от ${IDEA_DESCRIPTION_MIN} до ${IDEA_DESCRIPTION_MAX} символов ${at}`,
			);
		}

		const key = title.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		values.push({ id: randomUUID(), title, description });
	}

	const inserted = await db
		.insert(catalogIdea)
		.values(values)
		.onConflictDoNothing({ target: catalogIdea.title })
		.returning({ id: catalogIdea.id });

	return { added: inserted.length, skipped: items.length - inserted.length };
}

/** Удаляет идею из пула. Выданные не трогаем — они уже у пользователей. */
export async function deleteCatalogIdea(id: string): Promise<boolean> {
	const deleted = await db
		.delete(catalogIdea)
		.where(and(eq(catalogIdea.id, id), isNull(catalogIdea.issuedAt)))
		.returning({ id: catalogIdea.id });

	return deleted.length > 0;
}
