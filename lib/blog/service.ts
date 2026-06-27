import "server-only";

import { randomUUID } from "node:crypto";
import { and, desc, eq, ne } from "drizzle-orm";
import { db } from "@/drizzle";
import { article } from "@/drizzle/schema";
import {
	estimateReadingMinutes,
	isValidSlug,
	SLUG_MAX,
	slugify,
} from "@/lib/blog/slug";
import type {
	AdminArticle,
	AdminArticleRow,
	ArticleInput,
	ArticleStatus,
	BlogArticle,
	BlogListItem,
} from "@/lib/blog/types";

export class ArticleValidationError extends Error {}
export class ArticleNotFoundError extends Error {}
export class ArticleSlugTakenError extends Error {}

export const TITLE_MAX = 140;
export const EXCERPT_MAX = 320;
export const CONTENT_MAX = 60_000;
export const CATEGORY_MAX = 60;
export const SEO_TITLE_MAX = 70;
export const SEO_DESCRIPTION_MAX = 200;

function nullableTrim(value: string | null | undefined): string | null {
	const trimmed = value?.trim();
	return trimmed ? trimmed : null;
}

function normalizeStatus(status: unknown): ArticleStatus {
	return status === "published" ? "published" : "draft";
}

/** Проверяет и нормализует вход формы; бросает ArticleValidationError. */
function validate(input: ArticleInput): {
	slug: string;
	title: string;
	excerpt: string;
	content: string;
	category: string | null;
	coverImage: string | null;
	seoTitle: string | null;
	seoDescription: string | null;
	status: ArticleStatus;
	readingMinutes: number;
} {
	const title = input.title.trim();
	const excerpt = input.excerpt.trim();
	const content = input.content.trim();
	const slug = slugify(input.slug.trim() || title);

	if (title.length < 3 || title.length > TITLE_MAX) {
		throw new ArticleValidationError(
			`Заголовок — от 3 до ${TITLE_MAX} символов`,
		);
	}
	if (!isValidSlug(slug)) {
		throw new ArticleValidationError(
			`Слаг должен состоять из латиницы, цифр и дефисов (до ${SLUG_MAX} символов)`,
		);
	}
	if (excerpt.length < 10 || excerpt.length > EXCERPT_MAX) {
		throw new ArticleValidationError(
			`Анонс — от 10 до ${EXCERPT_MAX} символов`,
		);
	}
	if (content.length < 50 || content.length > CONTENT_MAX) {
		throw new ArticleValidationError(
			`Текст статьи — от 50 до ${CONTENT_MAX} символов`,
		);
	}

	return {
		slug,
		title,
		excerpt,
		content,
		category: nullableTrim(input.category)?.slice(0, CATEGORY_MAX) ?? null,
		coverImage: nullableTrim(input.coverImage),
		seoTitle: nullableTrim(input.seoTitle)?.slice(0, SEO_TITLE_MAX) ?? null,
		seoDescription:
			nullableTrim(input.seoDescription)?.slice(0, SEO_DESCRIPTION_MAX) ??
			null,
		status: normalizeStatus(input.status),
		readingMinutes: estimateReadingMinutes(content),
	};
}

// ---------------------------------------------------------------------------
// Публичное чтение
// ---------------------------------------------------------------------------

/** Опубликованные статьи для ленты /blog (новые сверху). */
export async function listPublishedArticles(): Promise<BlogListItem[]> {
	const rows = await db
		.select({
			slug: article.slug,
			title: article.title,
			excerpt: article.excerpt,
			category: article.category,
			readingMinutes: article.readingMinutes,
			publishedAt: article.publishedAt,
		})
		.from(article)
		.where(eq(article.status, "published"))
		.orderBy(desc(article.publishedAt));

	return rows
		.filter((r) => r.publishedAt !== null)
		.map((r) => ({
			slug: r.slug,
			title: r.title,
			excerpt: r.excerpt,
			category: r.category,
			readingMinutes: r.readingMinutes,
			publishedAt: r.publishedAt!.toISOString(),
		}));
}

/** Одна опубликованная статья по слагу (или null). */
export async function getPublishedArticle(
	slug: string,
): Promise<BlogArticle | null> {
	const [row] = await db
		.select()
		.from(article)
		.where(and(eq(article.slug, slug), eq(article.status, "published")))
		.limit(1);

	if (!row || !row.publishedAt) return null;

	return {
		slug: row.slug,
		title: row.title,
		excerpt: row.excerpt,
		content: row.content,
		category: row.category,
		coverImage: row.coverImage,
		seoTitle: row.seoTitle,
		seoDescription: row.seoDescription,
		readingMinutes: row.readingMinutes,
		publishedAt: row.publishedAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	};
}

/** Слаги опубликованных статей — для sitemap и статической генерации. */
export async function listPublishedSlugs(): Promise<
	{ slug: string; updatedAt: Date }[]
> {
	const rows = await db
		.select({ slug: article.slug, updatedAt: article.updatedAt })
		.from(article)
		.where(eq(article.status, "published"));
	return rows;
}

// ---------------------------------------------------------------------------
// Админ
// ---------------------------------------------------------------------------

export async function listArticlesAdmin(): Promise<AdminArticleRow[]> {
	const rows = await db
		.select({
			id: article.id,
			slug: article.slug,
			title: article.title,
			status: article.status,
			category: article.category,
			readingMinutes: article.readingMinutes,
			publishedAt: article.publishedAt,
			updatedAt: article.updatedAt,
		})
		.from(article)
		.orderBy(desc(article.updatedAt));

	return rows.map((r) => ({
		id: r.id,
		slug: r.slug,
		title: r.title,
		status: normalizeStatus(r.status),
		category: r.category,
		readingMinutes: r.readingMinutes,
		publishedAt: r.publishedAt?.toISOString() ?? null,
		updatedAt: r.updatedAt.toISOString(),
	}));
}

export async function getArticleAdmin(id: string): Promise<AdminArticle | null> {
	const [row] = await db
		.select()
		.from(article)
		.where(eq(article.id, id))
		.limit(1);

	if (!row) return null;

	return {
		id: row.id,
		slug: row.slug,
		title: row.title,
		excerpt: row.excerpt,
		content: row.content,
		category: row.category,
		coverImage: row.coverImage,
		seoTitle: row.seoTitle,
		seoDescription: row.seoDescription,
		status: normalizeStatus(row.status),
		readingMinutes: row.readingMinutes,
		publishedAt: row.publishedAt?.toISOString() ?? null,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	};
}

async function assertSlugFree(slug: string, exceptId?: string): Promise<void> {
	const where = exceptId
		? and(eq(article.slug, slug), ne(article.id, exceptId))
		: eq(article.slug, slug);
	const [existing] = await db
		.select({ id: article.id })
		.from(article)
		.where(where)
		.limit(1);
	if (existing) {
		throw new ArticleSlugTakenError(`Слаг «${slug}» уже занят`);
	}
}

export async function createArticle(
	input: ArticleInput,
): Promise<{ id: string; slug: string }> {
	const v = validate(input);
	await assertSlugFree(v.slug);

	const id = randomUUID();
	await db.insert(article).values({
		id,
		slug: v.slug,
		title: v.title,
		excerpt: v.excerpt,
		content: v.content,
		category: v.category,
		coverImage: v.coverImage,
		seoTitle: v.seoTitle,
		seoDescription: v.seoDescription,
		status: v.status,
		readingMinutes: v.readingMinutes,
		publishedAt: v.status === "published" ? new Date() : null,
	});

	return { id, slug: v.slug };
}

export async function updateArticle(
	id: string,
	input: ArticleInput,
): Promise<{ slug: string; previousSlug: string }> {
	const [current] = await db
		.select({
			slug: article.slug,
			status: article.status,
			publishedAt: article.publishedAt,
		})
		.from(article)
		.where(eq(article.id, id))
		.limit(1);
	if (!current) throw new ArticleNotFoundError("Статья не найдена");

	const v = validate(input);
	await assertSlugFree(v.slug, id);

	// publishedAt проставляется при первой публикации и далее не сбрасывается.
	let publishedAt = current.publishedAt;
	if (v.status === "published" && !publishedAt) {
		publishedAt = new Date();
	} else if (v.status === "draft") {
		publishedAt = null;
	}

	await db
		.update(article)
		.set({
			slug: v.slug,
			title: v.title,
			excerpt: v.excerpt,
			content: v.content,
			category: v.category,
			coverImage: v.coverImage,
			seoTitle: v.seoTitle,
			seoDescription: v.seoDescription,
			status: v.status,
			readingMinutes: v.readingMinutes,
			publishedAt,
			updatedAt: new Date(),
		})
		.where(eq(article.id, id));

	return { slug: v.slug, previousSlug: current.slug };
}

export async function deleteArticle(id: string): Promise<boolean> {
	const deleted = await db
		.delete(article)
		.where(eq(article.id, id))
		.returning({ id: article.id });
	return deleted.length > 0;
}
