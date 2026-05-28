import type { Idea } from "@/lib/ideas/types";

export const MOCK_BALANCE = 142;

export const CATALOG_POOL: Omit<Idea, "id" | "createdAt">[] = [
	{
		title: "CLI для аудита зависимостей monorepo",
		description:
			"Сканирует workspace, находит дубликаты версий и предлагает безопасные апдейты",
		verdict: null,
		score: null,
		tag: "DevTools",
		hasAnalysis: false,
	},
	{
		title: "Сервис A/B-тестов для лендингов соло",
		description: "Один скрипт, split-трафик, отчёт без Google Optimize",
		verdict: null,
		score: null,
		tag: "SaaS",
		hasAnalysis: false,
	},
	{
		title: "Бот напоминаний о ревью PR",
		description: "Интеграция с GitHub, Slack/Telegram, SLA по времени ответа",
		verdict: null,
		score: null,
		tag: "DevTools",
		hasAnalysis: false,
	},
];

export const ANAMNESIS_RESULT_POOL: Omit<Idea, "id" | "createdAt">[] = [
	{
		title: "Микро-SaaS для фрилансеров: счета + акты",
		description:
			"Простой биллинг под самозанятых: шаблоны, напоминания, экспорт для налоговой",
		verdict: "test",
		score: 72,
		tag: "SaaS",
		hasAnalysis: true,
	},
	{
		title: "Плагин «умных сниппетов» для Cursor",
		description: "Каталог промптов под задачу, горячие клавиши, локальный кэш",
		verdict: "do",
		score: 81,
		tag: "DevTools",
		hasAnalysis: true,
	},
];

export const INITIAL_IDEAS: Idea[] = [
	{
		id: "1",
		title: "Telegram-бот для квестов по городу",
		description: "Геолокация, NFT-награды, командная игра для локальных туров",
		verdict: "test",
		score: 68,
		tag: "MVP",
		createdAt: "2026-05-28T10:00:00Z",
		hasAnalysis: true,
	},
	{
		id: "2",
		title: "Линтер промптов для VS Code",
		description:
			"Локально проверяет качество промптов перед отправкой в LLM, подсказки по структуре",
		verdict: "do",
		score: 84,
		tag: "DevTools",
		createdAt: "2026-05-27T14:30:00Z",
		hasAnalysis: true,
	},
	{
		id: "3",
		title: "Подписка на «осознанные расходы»",
		description: "Анализ трат и еженедельный отчёт от ИИ с конкретными советами",
		verdict: "wait",
		score: 51,
		tag: "FinTech",
		createdAt: "2026-05-26T09:15:00Z",
		hasAnalysis: true,
	},
	{
		id: "4",
		title: "Биржа ML-моделей под русский язык",
		description: "Каталог дообученных моделей с бенчмарками и API для инференса",
		verdict: "do",
		score: 79,
		tag: "AI",
		createdAt: "2026-05-25T18:45:00Z",
		hasAnalysis: true,
	},
	{
		id: "5",
		title: "Сервис подбора подкастов под настроение",
		description: "ИИ ловит настроение по тексту запроса и собирает плейлист",
		verdict: "skip",
		score: 28,
		tag: "Media",
		createdAt: "2026-05-24T11:20:00Z",
		hasAnalysis: true,
	},
	{
		id: "6",
		title: "Калькулятор юнит-экономики для соло",
		description: "Один экран, без таблиц — ввод параметров и вердикт «сходится / нет»",
		verdict: "do",
		score: 81,
		tag: "SaaS",
		createdAt: "2026-05-23T16:00:00Z",
		hasAnalysis: true,
	},
	{
		id: "7",
		title: "Маркетплейс шаблонов лендингов от ИИ",
		description: "Промпт → готовая страница с CMS и базовой аналитикой",
		verdict: null,
		score: null,
		tag: "AI",
		createdAt: "2026-05-29T08:00:00Z",
		hasAnalysis: false,
	},
	{
		id: "8",
		title: "Email-дайджест индустрии за 60 секунд",
		description: "ИИ-сжимает 200 источников до 5 пунктов, персонализация по нише",
		verdict: null,
		score: null,
		tag: "Media",
		createdAt: "2026-05-29T07:30:00Z",
		hasAnalysis: false,
	},
];

/** Для демо-панели на странице логина */
export const LOGIN_DEMO_IDEAS = INITIAL_IDEAS.filter((i) => i.hasAnalysis)
	.slice(0, 8)
	.map((i) => ({
		title: i.title,
		desc: i.description,
		verdict: i.verdict!,
		score: i.score!,
		tag: i.tag ?? "",
	}));
