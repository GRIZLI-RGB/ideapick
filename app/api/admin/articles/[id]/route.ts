import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import {
	ArticleNotFoundError,
	ArticleSlugTakenError,
	ArticleValidationError,
	deleteArticle,
	getArticleAdmin,
	updateArticle,
} from "@/lib/blog/service";
import type { ArticleInput } from "@/lib/blog/types";

/** Сбрасывает кеш публичных страниц блога и карты сайта. */
function revalidateBlog(...slugs: (string | undefined)[]) {
	revalidatePath("/blog");
	revalidatePath("/sitemap.xml");
	for (const slug of slugs) {
		if (slug) revalidatePath(`/blog/${slug}`);
	}
}

function readInput(body: Record<string, unknown>): ArticleInput {
	const str = (v: unknown) => (typeof v === "string" ? v : "");
	const nullableStr = (v: unknown) => (typeof v === "string" ? v : null);
	return {
		slug: str(body.slug),
		title: str(body.title),
		excerpt: str(body.excerpt),
		content: str(body.content),
		category: nullableStr(body.category),
		coverImage: nullableStr(body.coverImage),
		seoTitle: nullableStr(body.seoTitle),
		seoDescription: nullableStr(body.seoDescription),
		status: body.status === "published" ? "published" : "draft",
	};
}

/** Обновление статьи блога. */
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const admin = await getAdminUser(request.headers);
	if (!admin) {
		return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
	}

	const { id } = await params;

	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
	}

	try {
		const { slug, previousSlug } = await updateArticle(id, readInput(body));
		revalidateBlog(slug, previousSlug);
		return NextResponse.json({ ok: true });
	} catch (error) {
		if (
			error instanceof ArticleValidationError ||
			error instanceof ArticleSlugTakenError
		) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}
		if (error instanceof ArticleNotFoundError) {
			return NextResponse.json({ error: error.message }, { status: 404 });
		}
		console.error("[admin] ошибка обновления статьи:", error);
		return NextResponse.json(
			{ error: "Не удалось сохранить статью. Попробуйте позже." },
			{ status: 500 },
		);
	}
}

/** Удаление статьи блога. */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const admin = await getAdminUser(request.headers);
	if (!admin) {
		return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
	}

	const { id } = await params;

	try {
		const existing = await getArticleAdmin(id);
		const removed = await deleteArticle(id);
		if (!removed) {
			return NextResponse.json(
				{ error: "Статья не найдена" },
				{ status: 404 },
			);
		}
		revalidateBlog(existing?.slug);
		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error("[admin] ошибка удаления статьи:", error);
		return NextResponse.json(
			{ error: "Не удалось удалить статью. Попробуйте позже." },
			{ status: 500 },
		);
	}
}
