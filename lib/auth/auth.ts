import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins";
import { db } from "@/drizzle";
import * as schema from "@/drizzle/schema";
import { sendMagicLinkEmail } from "@/lib/auth/email";
import { PRICES } from "@/lib/ideas/constants";

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
	databaseHooks: {
		user: {
			create: {
				after: async (createdUser) => {
					console.info(
						`[auth] новый пользователь ${createdUser.email}: ожидает начисление приветственного бонуса +${PRICES.welcomeBonus} ₽`,
					);
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

		nextCookies(),
	],
});
