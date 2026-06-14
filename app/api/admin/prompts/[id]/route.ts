import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import {
	PromptValidationError,
	updateTemplate,
} from "@/lib/llm/prompt-service";

/** Обновление шаблона промпта из админ-панели. */
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
		const updated = await updateTemplate(id, {
			name: String(body.name ?? ""),
			model: String(body.model ?? ""),
			thinking: Boolean(body.thinking),
			temperature: Number(body.temperature),
			maxTokens: Number(body.maxTokens),
			systemPrompt: String(body.systemPrompt ?? ""),
			userPromptTemplate: String(body.userPromptTemplate ?? ""),
			isActive: Boolean(body.isActive),
		});
		if (!updated) {
			return NextResponse.json({ error: "Шаблон не найден" }, { status: 404 });
		}
		return NextResponse.json({ template: updated });
	} catch (error) {
		if (error instanceof PromptValidationError) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}
		console.error("[admin] ошибка обновления промпта:", error);
		return NextResponse.json(
			{ error: "Не удалось сохранить. Попробуйте позже." },
			{ status: 500 },
		);
	}
}
