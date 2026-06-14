import "server-only";

const API_BASE = "https://api.deepseek.com";

const apiKey = process.env.DEEPSEEK_API_KEY;

/**
 * Настроен ли DeepSeek. Если ключа нет — анализ работает в локальном моковом
 * режиме (детерминированная заглушка вместо обращения к API), что удобно для
 * разработки. В проде ключ обязателен.
 */
export function isDeepseekConfigured(): boolean {
	return Boolean(apiKey);
}

/**
 * Актуальные ID моделей DeepSeek. Старые алиасы `deepseek-chat` /
 * `deepseek-reasoner` выводятся из эксплуатации 2026-07-24 — используем явные.
 */
export type DeepseekModel = "deepseek-v4-pro" | "deepseek-v4-flash";

export const DEEPSEEK_MODELS: DeepseekModel[] = [
	"deepseek-v4-pro",
	"deepseek-v4-flash",
];

/** Цены в USD за 1M токенов (по официальному прайсу DeepSeek). */
const PRICING: Record<
	DeepseekModel,
	{ cacheHit: number; cacheMiss: number; output: number }
> = {
	"deepseek-v4-pro": { cacheHit: 0.003625, cacheMiss: 0.435, output: 0.87 },
	"deepseek-v4-flash": { cacheHit: 0.0028, cacheMiss: 0.14, output: 0.28 },
};

export type DeepseekUsage = {
	prompt_tokens: number;
	completion_tokens: number;
	total_tokens: number;
	/** Часть prompt-токенов, попавших в кеш (дешевле). */
	prompt_cache_hit_tokens?: number;
	prompt_cache_miss_tokens?: number;
};

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

type ChatCompletionResponse = {
	choices: { message: { content: string } }[];
	usage?: DeepseekUsage;
};

export type DeepseekResult = {
	content: string;
	usage: DeepseekUsage;
	/** Стоимость запроса в микро-долларах (1e-6 USD), целое. */
	costMicroUsd: number;
};

/**
 * Стоимость запроса в микро-долларах. Цены заданы за 1M токенов, поэтому
 * micro-USD = tokens × rate (USD/1M). Кешированные prompt-токены тарифицируются
 * по льготной ставке cacheHit.
 */
export function computeCostMicroUsd(
	usage: DeepseekUsage,
	model: DeepseekModel,
): number {
	const rate = PRICING[model] ?? PRICING["deepseek-v4-pro"];
	const cacheHit = usage.prompt_cache_hit_tokens ?? 0;
	const cacheMiss =
		usage.prompt_cache_miss_tokens ?? Math.max(0, usage.prompt_tokens - cacheHit);
	const micro =
		cacheHit * rate.cacheHit +
		cacheMiss * rate.cacheMiss +
		usage.completion_tokens * rate.output;
	return Math.round(micro);
}

type CallArgs = {
	model: DeepseekModel;
	systemPrompt: string;
	userPrompt: string;
	/** Включить режим рассуждений (для v4-pro/flash). */
	thinking: boolean;
	/** Температура в долях единицы (0..2). */
	temperature: number;
	maxTokens: number;
	/** Принудительный JSON-ответ. */
	json?: boolean;
	/** Таймаут одного обращения, мс (по умолчанию 60с). */
	timeoutMs?: number;
	/** Сколько раз повторить при сетевой/временной ошибке (по умолчанию 1). */
	retries?: number;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Выполняет chat-completion к DeepSeek (OpenAI-совместимый формат) с таймаутом
 * и повтором при временных сбоях (обрыв сети/VPN, 429, 5xx). Бросает Error при
 * исчерпании попыток (как обёртки внешних API в lib/wallet).
 */
export async function callDeepseek({
	model,
	systemPrompt,
	userPrompt,
	thinking,
	temperature,
	maxTokens,
	json = true,
	timeoutMs = 60_000,
	retries = 1,
}: CallArgs): Promise<DeepseekResult> {
	if (!apiKey) {
		throw new Error("DEEPSEEK_API_KEY не задан");
	}

	const messages: ChatMessage[] = [
		{ role: "system", content: systemPrompt },
		{ role: "user", content: userPrompt },
	];

	const body = JSON.stringify({
		model,
		messages,
		temperature,
		max_tokens: maxTokens,
		thinking: { type: thinking ? "enabled" : "disabled" },
		...(json ? { response_format: { type: "json_object" } } : {}),
		stream: false,
	});

	let lastError: unknown;

	for (let attempt = 0; attempt <= retries; attempt++) {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), timeoutMs);
		try {
			const res = await fetch(`${API_BASE}/chat/completions`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json",
				},
				body,
				signal: controller.signal,
			});

			if (!res.ok) {
				const text = await res.text().catch(() => "");
				// 429/5xx — временные, имеет смысл повторить; прочие — сразу ошибка.
				const retryable = res.status === 429 || res.status >= 500;
				const error = new Error(
					`DeepSeek request failed (${res.status}): ${text}`,
				);
				if (retryable && attempt < retries) {
					lastError = error;
					await sleep(500 * (attempt + 1));
					continue;
				}
				throw error;
			}

			const data = (await res.json()) as ChatCompletionResponse;
			const content = data.choices?.[0]?.message?.content ?? "";
			const usage: DeepseekUsage = data.usage ?? {
				prompt_tokens: 0,
				completion_tokens: 0,
				total_tokens: 0,
			};

			return {
				content,
				usage,
				costMicroUsd: computeCostMicroUsd(usage, model),
			};
		} catch (error) {
			// Сетевой сбой или таймаут (AbortError) — повторяем, если есть попытки.
			lastError = error;
			if (attempt < retries) {
				await sleep(500 * (attempt + 1));
				continue;
			}
			throw error;
		} finally {
			clearTimeout(timer);
		}
	}

	throw lastError instanceof Error
		? lastError
		: new Error("DeepSeek request failed");
}
