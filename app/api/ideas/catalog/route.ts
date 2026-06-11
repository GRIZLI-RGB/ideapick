import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
	CatalogEmptyError,
	CatalogLimitError,
	claimCatalogIdea,
	getCatalogStatus,
} from "@/lib/ideas/catalog";

/** Выдача бесплатной идеи дня из каталога. */
export async function POST(request: NextRequest) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) {
		return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
	}

	try {
		const idea = await claimCatalogIdea(session.user.id);
		const status = await getCatalogStatus(session.user.id);
		return NextResponse.json({ idea, status }, { status: 201 });
	} catch (error) {
		if (error instanceof CatalogLimitError) {
			return NextResponse.json(
				{ error: error.message, code: "limit" },
				{ status: 429 },
			);
		}
		if (error instanceof CatalogEmptyError) {
			return NextResponse.json(
				{ error: error.message, code: "empty" },
				{ status: 409 },
			);
		}
		console.error("[ideas] ошибка выдачи идеи из каталога:", error);
		return NextResponse.json(
			{ error: "Не удалось получить идею. Попробуйте позже." },
			{ status: 500 },
		);
	}
}
