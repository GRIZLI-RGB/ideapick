import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { BetterAuthPlugin } from "better-auth";
import { APIError, createAuthEndpoint } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";

/**
 * Вход через Telegram. Telegram — НЕ OAuth2: Login Widget возвращает набор
 * полей пользователя, подписанных HMAC-SHA256 по токену бота. Здесь мы
 * проверяем подпись и сами создаём пользователя/сессию (как делает встроенный
 * magic-link плагин).
 *
 * Telegram не отдаёт email, а в схеме `user.email` обязателен и уникален,
 * поэтому заводим синтетический адрес `tg<id>@<TELEGRAM_EMAIL_DOMAIN>`.
 */
const TELEGRAM_EMAIL_DOMAIN = "telegram.ideapick.ru";
// Подпись Telegram считаем валидной ограниченное время — защита от повторного
// использования перехваченных параметров.
const MAX_AUTH_AGE_SECONDS = 24 * 60 * 60;

type TelegramOptions = {
	botToken: string;
};

/** Проверка подписи Telegram Login Widget (HMAC-SHA256, ключ = SHA256(botToken)). */
function isValidTelegramAuth(
	data: Record<string, string>,
	botToken: string,
): boolean {
	const { hash, ...fields } = data;
	if (!hash) return false;

	const checkString = Object.keys(fields)
		.sort()
		.map((key) => `${key}=${fields[key]}`)
		.join("\n");

	const secretKey = createHash("sha256").update(botToken).digest();
	const expected = createHmac("sha256", secretKey)
		.update(checkString)
		.digest("hex");

	const expectedBuf = Buffer.from(expected, "hex");
	const receivedBuf = Buffer.from(hash, "hex");
	if (expectedBuf.length !== receivedBuf.length) return false;
	return timingSafeEqual(expectedBuf, receivedBuf);
}

export function telegram(options: TelegramOptions) {
	return {
		id: "telegram",
		endpoints: {
			signInTelegram: createAuthEndpoint(
				"/telegram/callback",
				{ method: "GET" },
				async (ctx) => {
					const query = (ctx.query ?? {}) as Record<string, string>;
					const { callbackURL, ...authData } = query;

					if (!isValidTelegramAuth(authData, options.botToken)) {
						throw new APIError("UNAUTHORIZED", {
							message: "Подпись Telegram недействительна",
						});
					}

					const authDate = Number(authData.auth_date);
					if (
						!Number.isFinite(authDate) ||
						Date.now() / 1000 - authDate > MAX_AUTH_AGE_SECONDS
					) {
						throw new APIError("UNAUTHORIZED", {
							message: "Срок действия входа Telegram истёк",
						});
					}

					const telegramId = authData.id;
					if (!telegramId) {
						throw new APIError("BAD_REQUEST", {
							message: "Нет идентификатора Telegram",
						});
					}

					const email = `tg${telegramId}@${TELEGRAM_EMAIL_DOMAIN}`;
					const name =
						[authData.first_name, authData.last_name]
							.filter(Boolean)
							.join(" ") ||
						authData.username ||
						"Пользователь Telegram";

					let user = await ctx.context.internalAdapter
						.findUserByEmail(email)
						.then((res) => res?.user);

					if (!user) {
						user = await ctx.context.internalAdapter.createUser({
							email,
							emailVerified: false,
							name,
							image: authData.photo_url || undefined,
						});
					}

					if (!user) {
						throw new APIError("INTERNAL_SERVER_ERROR", {
							message: "Не удалось создать пользователя",
						});
					}

					const session = await ctx.context.internalAdapter.createSession(
						user.id,
					);
					if (!session) {
						throw new APIError("INTERNAL_SERVER_ERROR", {
							message: "Не удалось создать сессию",
						});
					}

					await setSessionCookie(ctx, { session, user });

					// Пускаем только внутренние пути — защита от open redirect.
					const safePath =
						callbackURL &&
						callbackURL.startsWith("/") &&
						!callbackURL.startsWith("//")
							? callbackURL
							: "/app/ideas";
					const dest = new URL(safePath, ctx.context.baseURL).toString();
					throw ctx.redirect(dest);
				},
			),
		},
	} satisfies BetterAuthPlugin;
}
