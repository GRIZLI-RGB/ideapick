import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import {
	addCatalogIdeas,
	CatalogValidationError,
} from "@/lib/ideas/catalog";

type RawItem = { title?: unknown; description?: unknown };

/** Пополнение пула каталога: принимает массив идей (форма или импорт JSON). */
export async function POST(request: NextRequest) {
	const admin = await getAdminUser(request.headers);
	if (!admin) {
		return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
	}

	let body: { items?: unknown };
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
	}

	if (!Array.isArray(body.items)) {
		return NextResponse.json(
			{ error: "Ожидается массив items" },
			{ status: 400 },
		);
	}

	const items = (body.items as RawItem[]).map((item) => ({
		title: typeof item?.title === "string" ? item.title : "",
		description: typeof item?.description === "string" ? item.description : "",
	}));

	try {
		const result = await addCatalogIdeas(items);
		return NextResponse.json(result, { status: 201 });
	} catch (error) {
		if (error instanceof CatalogValidationError) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}
		console.error("[admin] ошибка пополнения каталога:", error);
		return NextResponse.json(
			{ error: "Не удалось пополнить каталог. Попробуйте позже." },
			{ status: 500 },
		);
	}
}
