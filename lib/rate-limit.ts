import "server-only";

import { NextResponse } from "next/server";

/**
 * Простой in-memory rate limit (fixed window). Достаточно для одного инстанса
 * (текущий деплой — VPS + Next standalone, один процесс); состояние живёт в
 * памяти и сбрасывается при рестарте, что для защиты от всплесков приемлемо.
 *
 * Намеренно «без фанатизма»: лимиты щедрые и нужны лишь против случайного
 * даблклика и грубого спама дорогих/AI-эндпоинтов, а не для тонкого троттлинга.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
	ok: boolean;
	/** Сколько миллисекунд до сброса окна (для Retry-After). */
	retryAfterMs: number;
};

/**
 * Регистрирует обращение по ключу `key` в окне `windowMs` с лимитом `limit`.
 * Возвращает `ok: false`, если лимит в текущем окне исчерпан.
 */
export function rateLimit({
	key,
	limit,
	windowMs,
}: {
	key: string;
	limit: number;
	windowMs: number;
}): RateLimitResult {
	const now = Date.now();

	// Редкая ленивая чистка протухших окон, чтобы карта не росла бесконечно.
	if (buckets.size > 5000 && Math.random() < 0.02) {
		for (const [k, b] of buckets) {
			if (now >= b.resetAt) buckets.delete(k);
		}
	}

	const bucket = buckets.get(key);
	if (!bucket || now >= bucket.resetAt) {
		buckets.set(key, { count: 1, resetAt: now + windowMs });
		return { ok: true, retryAfterMs: 0 };
	}

	if (bucket.count >= limit) {
		return { ok: false, retryAfterMs: bucket.resetAt - now };
	}

	bucket.count += 1;
	return { ok: true, retryAfterMs: 0 };
}

/**
 * Удобная обёртка для роутов: если лимит исчерпан — готовый ответ 429, иначе
 * `null` (можно продолжать обработку).
 *
 *   const limited = rateLimitGuard({ key: `analyze:${userId}`, limit: 10, windowMs: 60_000 });
 *   if (limited) return limited;
 */
export function rateLimitGuard(args: {
	key: string;
	limit: number;
	windowMs: number;
}): NextResponse | null {
	const result = rateLimit(args);
	if (result.ok) return null;

	const retryAfter = Math.ceil(result.retryAfterMs / 1000);
	return NextResponse.json(
		{
			error: "Слишком много запросов подряд — подождите немного и повторите.",
			code: "rate_limited",
		},
		{ status: 429, headers: { "Retry-After": String(retryAfter) } },
	);
}
