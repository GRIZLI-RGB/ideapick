import "server-only";

import { randomUUID } from "node:crypto";
import { db } from "@/drizzle";
import { llmRequest } from "@/drizzle/schema";
import { estimateInputQuality } from "@/lib/analysis/input-quality";
import { buildRichMockReport } from "@/lib/analysis/rich-mock";
import { RICH_RADAR_KEYS } from "@/lib/analysis/rich-types";
import type {
	Confidence,
	RichAnalysisReport,
	RichAxis,
	RichAxisKey,
	Verdict,
} from "@/lib/analysis/rich-types";
import type { Complexity, Saturation } from "@/lib/analysis/types";
import {
	type DeepseekResult,
	callDeepseek,
	isDeepseekConfigured,
} from "@/lib/llm/deepseek";
import { fillUserPrompt } from "@/lib/llm/prompts";
import { getActiveTemplate } from "@/lib/llm/prompt-service";

export class AnalysisGenerationError extends Error {}

type GenerateArgs = {
	idea: { id: string; userId: string; title: string; description: string };
	version: number;
};

const CONFIDENCES: Confidence[] = ["low", "medium", "high"];
const VERDICTS: Verdict[] = ["build", "simplify_test", "pivot", "drop"];
const LEVELS = ["low", "medium", "high"];

function clampScore(value: unknown, fallback = 50): number {
	const n = typeof value === "number" ? value : Number(value);
	if (!Number.isFinite(n)) return fallback;
	return Math.min(100, Math.max(0, Math.round(n)));
}

function asConfidence(value: unknown): Confidence {
	return CONFIDENCES.includes(value as Confidence)
		? (value as Confidence)
		: "medium";
}

function asVerdict(value: unknown): Verdict {
	return VERDICTS.includes(value as Verdict)
		? (value as Verdict)
		: "simplify_test";
}

function asLevel<T extends Saturation | Complexity>(
	value: unknown,
): T | undefined {
	return LEVELS.includes(value as string) ? (value as T) : undefined;
}

function asStringList(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value
		.map((v) => (typeof v === "string" ? v.trim() : String(v ?? "")))
		.filter((v) => v.length > 0);
}

function asString(value: unknown, fallback = ""): string {
	return typeof value === "string" && value.trim().length > 0
		? value.trim()
		: fallback;
}

function buildAxis(raw: unknown): RichAxis {
	const o = (raw ?? {}) as Record<string, unknown>;
	const axis: RichAxis = {
		score: clampScore(o.score),
		confidence: asConfidence(o.confidence),
		bullets: asStringList(o.bullets),
	};
	const audience = asString(o.audience);
	if (audience) axis.audience = audience;
	const saturation = asLevel<Saturation>(o.saturation);
	if (saturation) axis.saturation = saturation;
	const complexity = asLevel<Complexity>(o.complexity);
	if (complexity) axis.complexity = complexity;
	if (typeof o.soloWeeks === "number" && Number.isFinite(o.soloWeeks)) {
		axis.soloWeeks = Math.max(0, Math.round(o.soloWeeks));
	}
	return axis;
}

/** Снимает возможные ```json-ограждения и парсит JSON ответа модели. */
function parseJsonContent(content: string): Record<string, unknown> {
	let text = content.trim();
	if (text.startsWith("```")) {
		text = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
	}
	const start = text.indexOf("{");
	const end = text.lastIndexOf("}");
	if (start > 0 || end < text.length - 1) {
		if (start >= 0 && end > start) text = text.slice(start, end + 1);
	}
	return JSON.parse(text) as Record<string, unknown>;
}

/**
 * Приводит сырой JSON модели к строгому {@link RichAnalysisReport}. Недостающие
 * поля заполняются безопасными значениями, оси — все шесть. `inputQuality`,
 * `analyzedAt` и `version` проставляет сервер.
 */
function coerceReport(
	raw: Record<string, unknown>,
	idea: { title: string; description: string },
	version: number,
): RichAnalysisReport {
	const rawAxes = (raw.axes ?? {}) as Record<string, unknown>;
	const axes = Object.fromEntries(
		RICH_RADAR_KEYS.map((key) => [key, buildAxis(rawAxes[key])]),
	) as Record<RichAxisKey, RichAxis>;

	const ka = (raw.killerAssumption ?? {}) as Record<string, unknown>;
	const test = (ka.test ?? {}) as Record<string, unknown>;

	const topScore =
		typeof raw.score === "number"
			? clampScore(raw.score)
			: Math.round(
					RICH_RADAR_KEYS.reduce((sum, k) => sum + axes[k].score, 0) /
						RICH_RADAR_KEYS.length,
				);

	return {
		score: topScore,
		confidence: asConfidence(raw.confidence),
		verdict: asVerdict(raw.verdict),
		verdictLine: asString(raw.verdictLine, "Вывод по идее не сформирован."),
		inputQuality: estimateInputQuality(idea.title, idea.description),
		summary: asString(raw.summary, ""),
		scoreRationale: asString(raw.scoreRationale, ""),
		analyzedAt: new Date().toISOString(),
		version,
		axes,
		killerAssumption: {
			statement: asString(ka.statement, "Ключевое допущение не выделено."),
			why: asString(ka.why, ""),
			test: {
				action: asString(test.action, ""),
				channel: asString(test.channel, ""),
				metric: asString(test.metric, ""),
				threshold: asString(test.threshold, ""),
				timeframe: asString(test.timeframe, ""),
			},
		},
		nextSteps: asStringList(raw.nextSteps),
	};
}

/**
 * Генерирует отчёт по идее через DeepSeek и пишет запись в журнал обращений.
 * Без ключа DeepSeek возвращает детерминированную заглушку (dev-режим).
 * Бросает {@link AnalysisGenerationError} при ошибке обращения/парсинга.
 */
export async function generateAnalysis({
	idea,
	version,
}: GenerateArgs): Promise<RichAnalysisReport> {
	if (!isDeepseekConfigured()) {
		return buildRichMockReport(
			{
				id: idea.id,
				title: idea.title,
				description: idea.description,
				score: null,
				createdAt: new Date().toISOString(),
				hasAnalysis: false,
				archived: false,
				report: null,
			},
			version,
		);
	}

	const template = await getActiveTemplate();
	const userPrompt = fillUserPrompt(template.userPromptTemplate, idea);
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
			idea,
			template,
			systemPrompt: template.systemPrompt,
			userPrompt,
			status: "error",
			latencyMs: Date.now() - startedAt,
			errorText: error instanceof Error ? error.message : String(error),
		});
		throw new AnalysisGenerationError("Не удалось обратиться к нейросети");
	}

	let report: RichAnalysisReport;
	try {
		report = coerceReport(parseJsonContent(result.content), idea, version);
	} catch (error) {
		await logRequest({
			idea,
			template,
			systemPrompt: template.systemPrompt,
			userPrompt,
			status: "error",
			latencyMs: Date.now() - startedAt,
			result,
			errorText: `Невалидный JSON: ${
				error instanceof Error ? error.message : String(error)
			}`,
		});
		throw new AnalysisGenerationError("Нейросеть вернула некорректный ответ");
	}

	await logRequest({
		idea,
		template,
		systemPrompt: template.systemPrompt,
		userPrompt,
		status: "ok",
		latencyMs: Date.now() - startedAt,
		result,
	});

	return report;
}

type LogArgs = {
	idea: { id: string; userId: string };
	template: { key: string; model: string };
	systemPrompt: string;
	userPrompt: string;
	status: "ok" | "error";
	latencyMs: number;
	result?: DeepseekResult;
	errorText?: string;
};

async function logRequest({
	idea,
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
			userId: idea.userId,
			ideaId: idea.id,
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
		// Журналирование не должно ломать основной поток анализа.
	}
}
