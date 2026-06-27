import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import {
	admin,
	genericOAuth,
	type GenericOAuthConfig,
	magicLink,
} from "better-auth/plugins";
import { db } from "@/drizzle";
import * as schema from "@/drizzle/schema";
import { sendMagicLinkEmail } from "@/lib/auth/email";
import { telegram } from "@/lib/auth/telegram";
import { grantWelcomeBonus } from "@/lib/wallet/service";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const socialProviders =
	googleClientId && googleClientSecret
		? {
				google: {
					clientId: googleClientId,
					clientSecret: googleClientSecret,
				},
			}
		: {};

// Yandex ID и Telegram подключаются только если заданы их секреты, чтобы
// локальная разработка без этих переменных не падала.
const yandexClientId = process.env.YANDEX_CLIENT_ID;
const yandexClientSecret = process.env.YANDEX_CLIENT_SECRET;
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN ?? "";

// Конфиг Yandex включаем только при наличии секретов. Сам плагин при этом
// всегда присутствует в массиве `plugins` (см. ниже): массив должен оставаться
// кортежем-литералом, иначе вывод типов better-auth схлопывается и теряются
// поля плагинов (например, user.role из admin-плагина).
const yandexConfig: GenericOAuthConfig[] =
	yandexClientId && yandexClientSecret
		? [
				{
					providerId: "yandex",
					clientId: yandexClientId,
					clientSecret: yandexClientSecret,
					authorizationUrl: "https://oauth.yandex.ru/authorize",
					tokenUrl: "https://oauth.yandex.ru/token",
					scopes: ["login:email", "login:info", "login:avatar"],
					// Yandex ждёт заголовок `Authorization: OAuth <token>`
					// (не Bearer) и отдаёт email в поле default_email — поэтому
					// тянем профиль вручную.
					getUserInfo: async (tokens) => {
						const res = await fetch(
							"https://login.yandex.ru/info?format=json",
							{
								headers: {
									Authorization: `OAuth ${tokens.accessToken}`,
								},
							},
						);
						if (!res.ok) return null;
						const profile = (await res.json()) as {
							id: string | number;
							login?: string;
							real_name?: string;
							display_name?: string;
							default_email?: string;
							emails?: string[];
							default_avatar_id?: string;
							is_avatar_empty?: boolean;
						};
						const email =
							profile.default_email ?? profile.emails?.[0];
						if (!email) return null;
						const image =
							profile.is_avatar_empty || !profile.default_avatar_id
								? undefined
								: `https://avatars.yandex.net/get-yapic/${profile.default_avatar_id}/islands-200`;
						return {
							id: String(profile.id),
							name:
								profile.real_name ||
								profile.display_name ||
								profile.login ||
								"Пользователь",
							email,
							emailVerified: true,
							image,
						};
					},
				},
			]
		: [];

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL,
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	emailAndPassword: { enabled: false },
	socialProviders,
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ["google"],
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 30, // 30 дней
		updateAge: 60 * 60 * 24, // продление раз в сутки
	},
	// Встроенный rate limit better-auth (in-memory). Включаем в проде; строже —
	// на запрос magic link, т.к. это рассылка писем и главный вектор спама.
	rateLimit: {
		enabled: process.env.NODE_ENV === "production",
		window: 60,
		max: 100,
		customRules: {
			"/sign-in/magic-link": { window: 60, max: 5 },
		},
	},
	databaseHooks: {
		user: {
			create: {
				after: async (createdUser) => {
					// Первый вход = регистрация → приветственный бонус +100 ₽.
					// Идемпотентно; ошибки логируем, но не блокируем вход.
					try {
						await grantWelcomeBonus(createdUser.id);
					} catch (error) {
						console.error(
							`[auth] не удалось начислить приветственный бонус ${createdUser.email}:`,
							error,
						);
					}
				},
			},
		},
	},
	plugins: [
		// Плагины Yandex и Telegram присутствуют всегда (кортеж-литерал для
		// корректного вывода типов). Их активность определяется наличием
		// секретов: пустой yandexConfig = провайдера нет; пустой botToken =
		// проверка подписи Telegram не пройдёт (вход недоступен).
		genericOAuth({ config: yandexConfig }),
		telegram({ botToken: telegramBotToken }),

		magicLink({
			sendMagicLink: async ({ email, url }) => {
				await sendMagicLinkEmail({ email, url });
			},
		}),

		admin({
			defaultRole: "user",
			defaultBanReason: "Нарушение правил сервиса",
			bannedUserMessage:
				"Аккаунт заблокирован. Напишите в поддержку: support@ideapick.ru",
		}),

		nextCookies(),
	],
});
