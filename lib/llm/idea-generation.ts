import "server-only";

import { randomUUID } from "node:crypto";
import { db } from "@/drizzle";
import { llmRequest } from "@/drizzle/schema";
import {
	ANAMNESIS_MAX_QUESTIONS,
	ANAMNESIS_OPTIONS_MAX,
	ANAMNESIS_QUESTION_MAX,
	serializeAnamnesisDialog,
	type AnamnesisExchange,
} from "@/lib/ideas/anamnesis";
import {
	IDEA_DESCRIPTION_MAX,
	IDEA_DESCRIPTION_MIN,
	IDEA_TITLE_MAX,
	IDEA_TITLE_MIN,
} from "@/lib/ideas/validation";
import {
	type DeepseekResult,
	callDeepseek,
	isDeepseekConfigured,
} from "@/lib/llm/deepseek";
import {
	ANAMNESIS_QUESTION_TEMPLATE_KEY,
	ANAMNESIS_TEMPLATE_KEY,
	fillAnamnesisPrompt,
} from "@/lib/llm/prompts";
import { getActiveTemplate } from "@/lib/llm/prompt-service";

export class IdeaGenerationError extends Error {}

export type GeneratedIdea = { title: string; description: string };

/** Следующий шаг опроса: либо вопрос с вариантами, либо сигнал «готово». */
export type AnamnesisStep =
	| { done: false; question: string; options: string[] }
	| { done: true };

function asString(value: unknown): string {
	return typeof value === "string" ? value.trim() : "";
}

/** Снимает возможные ```json-ограждения и парсит JSON ответа модели. */
function parseJsonContent(content: string): Record<string, unknown> {
	let text = content.trim();
	if (text.startsWith("```")) {
		text = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
	}
	const start = text.indexOf("{");
	const end = text.lastIndexOf("}");
	if (start >= 0 && end > start) text = text.slice(start, end + 1);
	return JSON.parse(text) as Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Следующий вопрос живого опроса
// ---------------------------------------------------------------------------

/** Заготовки вопросов для dev-режима без ключа DeepSeek. */
const MOCK_QUESTIONS: { question: string; options: string[] }[] = [
	{
		question: "С чего начнём — что вам ближе по духу?",
		options: ["Технологии", "Творчество", "Услуги людям", "Торговля"],
	},
	{
		question: "Сколько времени готовы вкладывать в неделю?",
		options: ["Пара часов", "Полдня", "Почти фултайм"],
	},
	{
		question: "Какой бюджет на старт?",
		options: ["Почти ноль", "До 50 000 ₽", "Больше 50 000 ₽"],
	},
	{
		question: "Как хотите зарабатывать?",
		options: ["Подписка", "Разовые продажи", "Комиссия", "Реклама"],
	},
	{
		question: "Какая главная цель?",
		options: ["Подработка", "Свой бизнес", "Опыт и портфолио"],
	},
];

function coerceStep(raw: Record<string, unknown>): AnamnesisStep {
	if (raw.done === true) return { done: true };

	const question = asString(raw.question).slice(0, ANAMNESIS_QUESTION_MAX);
	const options = Array.isArray(raw.options)
		? raw.options
				.map((o) => asString(o))
				.filter((o) => o.length > 0)
				.slice(0, ANAMNESIS_OPTIONS_MAX)
		: [];

	if (!question) {
		throw new IdeaGenerationError("Пустой вопрос от нейросети");
	}
	return { done: false, question, options };
}

type StepArgs = { userId: string; history: AnamnesisExchange[] };

/**
 * Возвращает следующий вопрос опроса (или сигнал готовности) на основе диалога.
 * При достижении потолка вопросов завершает опрос принудительно. Без ключа
 * DeepSeek работает на детерминированных заготовках (dev-режим).
 */
export async function nextAnamnesisQuestion({
	userId,
	history,
}: StepArgs): Promise<AnamnesisStep> {
	// Достигли потолка — больше не спрашиваем, пора подбирать идею.
	if (history.length >= ANAMNESIS_MAX_QUESTIONS) return { done: true };

	if (!isDeepseekConfigured()) {
		const next = MOCK_QUESTIONS[history.length];
		return next
			? { done: false, question: next.question, options: next.options }
			: { done: true };
	}

	const template = await getActiveTemplate(ANAMNESIS_QUESTION_TEMPLATE_KEY);
	const dialog = serializeAnamnesisDialog(history);
	const userPrompt = fillAnamnesisPrompt(template.userPromptTemplate, dialog);
	const startedAt = Date.now();

	let result: DeepseekResult;
	try {
		result = await callDeepseek({
			model: template.model,
			systemPrompt: template.systemPrompt,
			userPrompt,
			thinking: template.thinking,
			temperature: template.temperature / 100,
			maxTokens: template.maxTokens,
			json: true,
		});
	} catch (error) {
		await logRequest({
			userId,
			template,
			systemPrompt: template.systemPrompt,
			userPrompt,
			status: "error",
			latencyMs: Date.now() - startedAt,
			errorText: error instanceof Error ? error.message : String(error),
		});
		throw new IdeaGenerationError("Не удалось обратиться к нейросети");
	}

	let step: AnamnesisStep;
	try {
		step = coerceStep(parseJsonContent(result.content));
	} catch (error) {
		await logRequest({
			userId,
			template,
			systemPrompt: template.systemPrompt,
			userPrompt,
			status: "error",
			latencyMs: Date.now() - startedAt,
			result,
			errorText: `Невалидный ответ: ${
				error instanceof Error ? error.message : String(error)
			}`,
		});
		throw new IdeaGenerationError("Нейросеть вернула некорректный вопрос");
	}

	await logRequest({
		userId,
		template,
		systemPrompt: template.systemPrompt,
		userPrompt,
		status: "ok",
		latencyMs: Date.now() - startedAt,
		result,
	});

	return step;
}

// ---------------------------------------------------------------------------
// Финальная генерация идеи по диалогу
// ---------------------------------------------------------------------------

/**
 * Приводит сырой ответ модели к корректной идее в рамках лимитов полей.
 * Заголовок/описание обрезаются по верхней границе; если описание короче
 * минимума — считаем генерацию неуспешной.
 */
function coerceIdea(raw: Record<string, unknown>): GeneratedIdea {
	const title = asString(raw.title)
		.replace(/^[«"'`]+|[»"'`]+$/g, "")
		.slice(0, IDEA_TITLE_MAX)
		.trim();
	const description = asString(raw.description).slice(0, IDEA_DESCRIPTION_MAX).trim();

	if (title.length < IDEA_TITLE_MIN || description.length < IDEA_DESCRIPTION_MIN) {
		throw new IdeaGenerationError("Нейросеть вернула слишком короткую идею");
	}

	return { title, description };
}

/**
 * Детерминированная заглушка генерации для dev-режима без ключа DeepSeek.
 * Строит правдоподобную идею на основе диалога.
 */
function buildMockIdea(history: AnamnesisExchange[]): GeneratedIdea {
	const first = history[0]?.answer ?? "Технологии";
	const monetization =
		history.find((e) => /зараб|монет|подписк|продаж|комисс|реклам/i.test(e.question))
			?.answer ?? "подписка";

	const audience = /творч/i.test(first)
		? "авторов и небольших студий"
		: /услуг/i.test(first)
			? "локальных сервисных команд"
			: /торгов/i.test(first)
				? "небольших интернет-магазинов"
				: "соло-разработчиков и инди-команд";

	const title = `Нишевый инструмент для ${audience}`;
	const description =
		`Сервис, который закрывает одну узкую повторяющуюся задачу ${audience}: ` +
		`экономит время на рутине и быстро приносит пользу без сложного онбординга. ` +
		`Модель заработка: ${monetization.toLowerCase()}. Это демо-идея локального режима без ключа DeepSeek — ` +
		`подключите API-ключ, чтобы получать персональные идеи по вашему диалогу.`;

	return coerceIdea({ title, description });
}

type GenerateArgs = { userId: string; history: AnamnesisExchange[] };

/**
 * Генерирует одну релевантную идею по диалогу опроса через DeepSeek и пишет
 * запись в журнал обращений. Без ключа DeepSeek возвращает детерминированную
 * заглушку (dev-режим). Бросает {@link IdeaGenerationError} при ошибке.
 */
export async function generateIdeaFromAnamnesis({
	userId,
	history,
}: GenerateArgs): Promise<GeneratedIdea> {
	if (!isDeepseekConfigured()) {
		return buildMockIdea(history);
	}

	const template = await getActiveTemplate(ANAMNESIS_TEMPLATE_KEY);
	const dialog = serializeAnamnesisDialog(history);
	const userPrompt = fillAnamnesisPrompt(template.userPromptTemplate, dialog);
	const startedAt = Date.now();

	let result: DeepseekResult;
	try {
		result = await callDeepseek({
			model: template.model,
			systemPrompt: template.systemPrompt,
			userPrompt,
			thinking: template.thinking,
			temperature: template.temperature / 100,
			maxTokens: template.maxTokens,
			json: true,
		});
	} catch (error) {
		await logRequest({
			userId,
			template,
			systemPrompt: template.systemPrompt,
			userPrompt,
			status: "error",
			latencyMs: Date.now() - startedAt,
			errorText: error instanceof Error ? error.message : String(error),
		});
		throw new IdeaGenerationError("Не удалось обратиться к нейросети");
	}

	let idea: GeneratedIdea;
	try {
		idea = coerceIdea(parseJsonContent(result.content));
	} catch (error) {
		await logRequest({
			userId,
			template,
			systemPrompt: template.systemPrompt,
			userPrompt,
			status: "error",
			latencyMs: Date.now() - startedAt,
			result,
			errorText: `Невалидный ответ: ${
				error instanceof Error ? error.message : String(error)
			}`,
		});
		throw new IdeaGenerationError("Нейросеть вернула некорректный ответ");
	}

	await logRequest({
		userId,
		template,
		systemPrompt: template.systemPrompt,
		userPrompt,
		status: "ok",
		latencyMs: Date.now() - startedAt,
		result,
	});

	return idea;
}

// ---------------------------------------------------------------------------
// Журналирование обращений
// ---------------------------------------------------------------------------

type LogArgs = {
	userId: string;
	template: { key: string; model: string };
	systemPrompt: string;
	userPrompt: string;
	status: "ok" | "error";
	latencyMs: number;
	result?: DeepseekResult;
	errorText?: string;
};

async function logRequest({
	userId,
	template,
	systemPrompt,
	userPrompt,
	status,
	latencyMs,
	result,
	errorText,
}: LogArgs): Promise<void> {
	const usage = result?.usage;
	const cached = usage?.prompt_cache_hit_tokens ?? 0;
	try {
		await db.insert(llmRequest).values({
			id: randomUUID(),
			userId,
			// Идея ещё не создана на момент генерации — связь по ideaId отсутствует.
			ideaId: null,
			templateKey: template.key,
			model: template.model,
			status,
			systemPrompt,
			userPrompt,
			responseContent: result?.content ?? "",
			promptTokens: usage?.prompt_tokens ?? 0,
			completionTokens: usage?.completion_tokens ?? 0,
			totalTokens: usage?.total_tokens ?? 0,
			cachedTokens: cached,
			costMicroUsd: result?.costMicroUsd ?? 0,
			latencyMs,
			errorText: errorText ?? null,
		});
	} catch {
		// Журналирование не должно ломать основной поток.
	}
}
