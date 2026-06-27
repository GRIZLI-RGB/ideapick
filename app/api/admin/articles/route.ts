import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import {
	ArticleSlugTakenError,
	ArticleValidationError,
	createArticle,
} from "@/lib/blog/service";
import type { ArticleInput } from "@/lib/blog/types";

/** Сбрасывает кеш публичных страниц блога и карты сайта. */
function revalidateBlog(slug?: string) {
	revalidatePath("/blog");
	revalidatePath("/sitemap.xml");
	if (slug) revalidatePath(`/blog/${slug}`);
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

/** Создание статьи блога. */
export async function POST(request: NextRequest) {
	const admin = await getAdminUser(request.headers);
	if (!admin) {
		return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
	}

	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
	}

	try {
		const result = await createArticle(readInput(body));
		revalidateBlog(result.slug);
		return NextResponse.json(result, { status: 201 });
	} catch (error) {
		if (
			error instanceof ArticleValidationError ||
			error instanceof ArticleSlugTakenError
		) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}
		console.error("[admin] ошибка создания статьи:", error);
		return NextResponse.json(
			{ error: "Не удалось создать статью. Попробуйте позже." },
			{ status: 500 },
		);
	}
}
