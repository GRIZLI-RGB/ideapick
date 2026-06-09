import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { createIdea, IdeaValidationError } from "@/lib/ideas/service";

const VALID_SOURCES = new Set(["manual", "catalog", "anamnesis"]);

export async function POST(request: NextRequest) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) {
		return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
	}

	let body: { title?: unknown; description?: unknown; source?: unknown };
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
	}

	const title = typeof body.title === "string" ? body.title : "";
	const description =
		typeof body.description === "string" ? body.description : "";
	const source =
		typeof body.source === "string" && VALID_SOURCES.has(body.source)
			? (body.source as "manual" | "catalog" | "anamnesis")
			: "manual";

	try {
		const idea = await createIdea({
			userId: session.user.id,
			title,
			description,
			source,
		});
		return NextResponse.json({ idea }, { status: 201 });
	} catch (error) {
		if (error instanceof IdeaValidationError) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}
		console.error("[ideas] ошибка создания идеи:", error);
		return NextResponse.json(
			{ error: "Не удалось сохранить идею. Попробуйте позже." },
			{ status: 500 },
		);
	}
}
