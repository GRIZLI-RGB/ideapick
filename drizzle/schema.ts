import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import type { RichAnalysisReport } from "@/lib/analysis/rich-types";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull().default(false),
	image: text("image"),
	// Баланс в целых рублях. Все цены продукта — целые рубли (см. lib/ideas/constants).
	balance: integer("balance").notNull().default(0),
	// Поля better-auth admin-плагина: user | admin.
	role: text("role").notNull().default("user"),
	banned: boolean("banned").notNull().default(false),
	banReason: text("ban_reason"),
	banExpires: timestamp("ban_expires"),
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
	// better-auth admin-плагин: id админа при имперсонации.
	impersonatedBy: text("impersonated_by"),
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

/**
 * Бизнес-идея пользователя. Создаётся вручную, из каталога или по анамнезу.
 *
 * `score` и `hasAnalysis` остаются пустыми до запуска AI-анализа (отдельная
 * фича) — здесь хранится только сама идея: название и описание.
 */
export const idea = pgTable(
	"idea",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		title: text("title").notNull(),
		description: text("description").notNull().default(""),
		// 0–100; null — анализ ещё не проводился.
		score: integer("score"),
		hasAnalysis: boolean("has_analysis").notNull().default(false),
		// Полный отчёт последнего анализа (RichAnalysisReport). null — отчёта нет.
		analysisReport: jsonb("analysis_report").$type<RichAnalysisReport>(),
		// null | pending | ok | failed — статус последнего запуска анализа.
		analysisStatus: text("analysis_status"),
		// id транзакции списания за текущий/последний запуск анализа. Нужен, чтобы
		// надёжно вернуть деньги при сбое генерации — в т.ч. из «сторожа» зависших
		// pending после рестарта процесса (когда фоновая задача не довыполнилась).
		analysisChargeTxId: text("analysis_charge_tx_id"),
		// manual | catalog | anamnesis — источник появления идеи.
		source: text("source").notNull().default("manual"),
		// null — активная; дата — когда перенесена в архив (скрыта из списка).
		archivedAt: timestamp("archived_at"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [index("idea_user_idx").on(table.userId, table.createdAt)],
);

/**
 * Сессия живого опроса «по анамнезу». Создаётся при предоплате (status `paid`):
 * оплата списывается ДО первого обращения к нейросети, что гейтит вопросы
 * опроса. При успешном подборе идеи сессия помечается `used` и связывается с
 * созданной идеей. Незавершённая оплаченная сессия переиспользуется при
 * повторном открытии, чтобы не списывать повторно.
 */
export const anamnesisSession = pgTable(
	"anamnesis_session",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		// paid | used
		status: text("status").notNull().default("paid"),
		// Идея, созданная по итогам опроса (после успешного подбора).
		ideaId: text("idea_id").references(() => idea.id, {
			onDelete: "set null",
		}),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		usedAt: timestamp("used_at"),
	},
	(table) => [
		index("anamnesis_session_user_idx").on(table.userId, table.status),
	],
);

/**
 * Пул готовых идей для бесплатной выдачи «из каталога».
 *
 * Идея выдаётся ровно один раз глобально: при выдаче проставляются
 * `issuedToUserId` + `issuedAt`, и запись больше никому не достаётся.
 * Пополняется через админ-панель (/admin/catalog).
 */
export const catalogIdea = pgTable(
	"catalog_idea",
	{
		id: text("id").primaryKey(),
		// Уникальность защищает от дублей при повторном импорте JSON.
		title: text("title").notNull().unique(),
		description: text("description").notNull(),
		issuedToUserId: text("issued_to_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		issuedAt: timestamp("issued_at"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [
		// Дневной лимит пользователя: выдачи за сегодня ищутся по этой паре.
		index("catalog_idea_issued_idx").on(table.issuedToUserId, table.issuedAt),
	],
);

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

/**
 * Обращение в поддержку. `number` — короткий человекочитаемый номер для UI
 * («#1042»), первичный ключ — UUID, как и везде.
 */
export const supportTicket = pgTable(
	"support_ticket",
	{
		id: text("id").primaryKey(),
		number: integer("number").generatedAlwaysAsIdentity().notNull().unique(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		subject: text("subject").notNull(),
		// open | in_progress | answered | closed
		status: text("status").notNull().default("open"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [
		index("support_ticket_user_idx").on(table.userId, table.updatedAt),
		index("support_ticket_status_idx").on(table.status, table.updatedAt),
	],
);

export const supportMessage = pgTable(
	"support_message",
	{
		id: text("id").primaryKey(),
		ticketId: text("ticket_id")
			.notNull()
			.references(() => supportTicket.id, { onDelete: "cascade" }),
		// user | support
		author: text("author").notNull(),
		body: text("body").notNull(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [
		index("support_message_ticket_idx").on(table.ticketId, table.createdAt),
	],
);

/**
 * Настраиваемый промпт для обращения к нейросети. Редактируется из админ-панели
 * (/admin/prompts). `key` — стабильный слаг назначения (напр. `idea-analysis`),
 * активный шаблон по этому ключу используется при генерации.
 */
export const promptTemplate = pgTable(
	"prompt_template",
	{
		id: text("id").primaryKey(),
		// Назначение шаблона, напр. idea-analysis.
		key: text("key").notNull(),
		name: text("name").notNull(),
		// ID модели DeepSeek (deepseek-v4-pro | deepseek-v4-flash).
		model: text("model").notNull().default("deepseek-v4-pro"),
		// Режим рассуждений модели.
		thinking: boolean("thinking").notNull().default(true),
		// Температура ×100 (целое): 30 → 0.3.
		temperature: integer("temperature").notNull().default(40),
		maxTokens: integer("max_tokens").notNull().default(8000),
		systemPrompt: text("system_prompt").notNull(),
		// Шаблон пользовательского сообщения с плейсхолдерами {{title}}/{{description}}.
		userPromptTemplate: text("user_prompt_template").notNull(),
		isActive: boolean("is_active").notNull().default(true),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [index("prompt_template_key_idx").on(table.key, table.isActive)],
);

/**
 * Журнал обращений к нейросети. Пишется на каждый запрос анализа (успех и
 * ошибка). Хранит промпт, ответ, токены и расчётную стоимость для админ-панели.
 *
 * `costMicroUsd` — стоимость в микро-долларах (1e-6 USD), целое.
 */
export const llmRequest = pgTable(
	"llm_request",
	{
		id: text("id").primaryKey(),
		userId: text("user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		ideaId: text("idea_id").references(() => idea.id, {
			onDelete: "set null",
		}),
		// Ключ использованного шаблона промпта.
		templateKey: text("template_key"),
		model: text("model").notNull(),
		// ok | error
		status: text("status").notNull(),
		systemPrompt: text("system_prompt").notNull().default(""),
		userPrompt: text("user_prompt").notNull().default(""),
		responseContent: text("response_content").notNull().default(""),
		promptTokens: integer("prompt_tokens").notNull().default(0),
		completionTokens: integer("completion_tokens").notNull().default(0),
		totalTokens: integer("total_tokens").notNull().default(0),
		cachedTokens: integer("cached_tokens").notNull().default(0),
		costMicroUsd: integer("cost_micro_usd").notNull().default(0),
		latencyMs: integer("latency_ms").notNull().default(0),
		errorText: text("error_text"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [index("llm_request_created_idx").on(table.createdAt)],
);
