import {
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull().default(false),
	image: text("image"),
	// Баланс в целых рублях. Все цены продукта — целые рубли (см. lib/ideas/constants).
	balance: integer("balance").notNull().default(0),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	token: text("token").notNull().unique(),
	expiresAt: timestamp("expires_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Платёж пополнения баланса (ЮKassa).
 *
 * `amount` — сумма, которую пользователь оплачивает (рубли).
 * `bonus` — промо-бонус за объём (не оплачивается пользователем).
 * `credited` = amount + bonus — сколько зачисляется на баланс при успехе.
 */
export const payment = pgTable(
	"payment",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		amount: integer("amount").notNull(),
		bonus: integer("bonus").notNull().default(0),
		credited: integer("credited").notNull(),
		currency: text("currency").notNull().default("RUB"),
		// pending | succeeded | canceled
		status: text("status").notNull().default("pending"),
		// yookassa | test
		provider: text("provider").notNull(),
		providerPaymentId: text("provider_payment_id"),
		idempotenceKey: text("idempotence_key").notNull(),
		description: text("description"),
		// Куда вернуть пользователя после оплаты (внутренний путь).
		returnPath: text("return_path").notNull().default("/app/ideas"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
		capturedAt: timestamp("captured_at"),
	},
	(table) => [index("payment_user_idx").on(table.userId, table.createdAt)],
);

/**
 * Леджер операций кошелька. Источник правды по истории; баланс пользователя —
 * денормализованная сумма, изменяется атомарно вместе с записью сюда.
 *
 * `amount` со знаком: + зачисление, − списание.
 */
export const walletTransaction = pgTable(
	"wallet_transaction",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		// welcome | topup | bonus | analysis | anamnesis
		kind: text("kind").notNull(),
		amount: integer("amount").notNull(),
		label: text("label").notNull(),
		paymentId: text("payment_id").references(() => payment.id, {
			onDelete: "set null",
		}),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [
		index("wallet_tx_user_idx").on(table.userId, table.createdAt),
	],
);
