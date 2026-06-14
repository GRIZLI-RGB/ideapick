import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, magicLink } from "better-auth/plugins";
import { db } from "@/drizzle";
import * as schema from "@/drizzle/schema";
import { sendMagicLinkEmail } from "@/lib/auth/email";
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
