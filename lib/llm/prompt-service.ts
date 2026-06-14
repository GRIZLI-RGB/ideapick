import "server-only";

import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/drizzle";
import { promptTemplate } from "@/drizzle/schema";
import { DEEPSEEK_MODELS, type DeepseekModel } from "@/lib/llm/deepseek";
import {
	ANALYSIS_TEMPLATE_KEY,
	DEFAULT_ANALYSIS_TEMPLATE,
	type PromptTemplateConfig,
} from "@/lib/llm/prompts";

export class PromptValidationError extends Error {}

export type PromptTemplate = PromptTemplateConfig & {
	id: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
};

function toModel(value: string): DeepseekModel {
	return (DEEPSEEK_MODELS as string[]).includes(value)
		? (value as DeepseekModel)
		: DEFAULT_ANALYSIS_TEMPLATE.model;
}

function toTemplate(row: typeof promptTemplate.$inferSelect): PromptTemplate {
	return {
		id: row.id,
		key: row.key,
		name: row.name,
		model: toModel(row.model),
		thinking: row.thinking,
		temperature: row.temperature,
		maxTokens: row.maxTokens,
		systemPrompt: row.systemPrompt,
		userPromptTemplate: row.userPromptTemplate,
		isActive: row.isActive,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	};
}

/** Создаёт дефолтный шаблон, если по ключу анализа ещё ничего нет. */
async function ensureSeeded(): Promise<void> {
	const [existing] = await db
		.select({ id: promptTemplate.id })
		.from(promptTemplate)
		.where(eq(promptTemplate.key, ANALYSIS_TEMPLATE_KEY))
		.limit(1);

	if (existing) return;

	await db.insert(promptTemplate).values({
		id: randomUUID(),
		key: DEFAULT_ANALYSIS_TEMPLATE.key,
		name: DEFAULT_ANALYSIS_TEMPLATE.name,
		model: DEFAULT_ANALYSIS_TEMPLATE.model,
		thinking: DEFAULT_ANALYSIS_TEMPLATE.thinking,
		temperature: DEFAULT_ANALYSIS_TEMPLATE.temperature,
		maxTokens: DEFAULT_ANALYSIS_TEMPLATE.maxTokens,
		systemPrompt: DEFAULT_ANALYSIS_TEMPLATE.systemPrompt,
		userPromptTemplate: DEFAULT_ANALYSIS_TEMPLATE.userPromptTemplate,
		isActive: true,
	});
}

/**
 * Активный шаблон по ключу назначения. Если в БД ничего нет — сидирует дефолт
 * и возвращает его конфиг (приложение работоспособно до правок из админки).
 */
export async function getActiveTemplate(
	key: string = ANALYSIS_TEMPLATE_KEY,
): Promise<PromptTemplateConfig> {
	const [row] = await db
		.select()
		.from(promptTemplate)
		.where(and(eq(promptTemplate.key, key), eq(promptTemplate.isActive, true)))
		.orderBy(desc(promptTemplate.updatedAt))
		.limit(1);

	if (row) return toTemplate(row);

	if (key === ANALYSIS_TEMPLATE_KEY) {
		await ensureSeeded();
		return DEFAULT_ANALYSIS_TEMPLATE;
	}

	return DEFAULT_ANALYSIS_TEMPLATE;
}

/** Все шаблоны для админ-панели (сидирует дефолт при первом обращении). */
export async function listTemplates(): Promise<PromptTemplate[]> {
	await ensureSeeded();
	const rows = await db
		.select()
		.from(promptTemplate)
		.orderBy(desc(promptTemplate.updatedAt));
	return rows.map(toTemplate);
}

export type UpdateTemplateInput = {
	name: string;
	model: string;
	thinking: boolean;
	temperature: number;
	maxTokens: number;
	systemPrompt: string;
	userPromptTemplate: string;
	isActive: boolean;
};

/** Обновляет шаблон из админ-панели. Бросает {@link PromptValidationError}. */
export async function updateTemplate(
	id: string,
	input: UpdateTemplateInput,
): Promise<PromptTemplate | null> {
	const name = input.name.trim();
	const systemPrompt = input.systemPrompt.trim();
	const userPromptTemplate = input.userPromptTemplate.trim();

	if (name.length < 2) {
		throw new PromptValidationError("Название слишком короткое");
	}
	if (systemPrompt.length < 10) {
		throw new PromptValidationError("Системный промпт слишком короткий");
	}
	if (!userPromptTemplate.includes("{{description}}")) {
		throw new PromptValidationError(
			"Пользовательский промпт должен содержать {{description}}",
		);
	}
	if (!(DEEPSEEK_MODELS as string[]).includes(input.model)) {
		throw new PromptValidationError("Неизвестная модель");
	}
	if (input.temperature < 0 || input.temperature > 200) {
		throw new PromptValidationError("Температура вне диапазона 0–2.0");
	}
	if (input.maxTokens < 500 || input.maxTokens > 64000) {
		throw new PromptValidationError("max_tokens вне диапазона 500–64000");
	}

	const [row] = await db
		.update(promptTemplate)
		.set({
			name,
			model: input.model,
			thinking: input.thinking,
			temperature: Math.round(input.temperature),
			maxTokens: Math.round(input.maxTokens),
			systemPrompt,
			userPromptTemplate,
			isActive: input.isActive,
			updatedAt: new Date(),
		})
		.where(eq(promptTemplate.id, id))
		.returning();

	return row ? toTemplate(row) : null;
}
