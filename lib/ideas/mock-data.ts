import type { Idea } from "@/lib/ideas/types";

export const ANAMNESIS_RESULT_POOL: Omit<
	Idea,
	"id" | "createdAt" | "archived"
>[] = [
	{
		title: "Микро-SaaS для фрилансеров: счета + акты",
		description:
			"Простой биллинг под самозанятых: шаблоны, напоминания, экспорт для налоговой",
		score: null,
		hasAnalysis: false,
	},
	{
		title: "Плагин «умных сниппетов» для Cursor",
		description: "Каталог промптов под задачу, горячие клавиши, локальный кэш",
		score: null,
		hasAnalysis: false,
	},
];

/** Демо-данные (только для витрины на /login) — без поля archived. */
export const INITIAL_IDEAS: Omit<Idea, "archived">[] = [
	{
		id: "1",
		title: "Telegram-бот для квестов по городу",
		description: "Геолокация, NFT-награды, командная игра для локальных туров",
		score: 68,
		createdAt: "2026-05-28T10:00:00Z",
		hasAnalysis: true,
	},
	{
		id: "2",
		title: "Линтер промптов для VS Code",
		description:
			"Локально проверяет качество промптов перед отправкой в LLM, подсказки по структуре",
		score: 84,
		createdAt: "2026-05-27T14:30:00Z",
		hasAnalysis: true,
	},
	{
		id: "3",
		title: "Подписка на «осознанные расходы»",
		description: "Анализ трат и еженедельный отчёт от ИИ с конкретными советами",
		score: 51,
		createdAt: "2026-05-26T09:15:00Z",
		hasAnalysis: true,
	},
	{
		id: "4",
		title: "Биржа ML-моделей под русский язык",
		description: "Каталог дообученных моделей с бенчмарками и API для инференса",
		score: 79,
		createdAt: "2026-05-25T18:45:00Z",
		hasAnalysis: true,
	},
	{
		id: "5",
		title: "Сервис подбора подкастов под настроение",
		description: "ИИ ловит настроение по тексту запроса и собирает плейлист",
		score: 28,
		createdAt: "2026-05-24T11:20:00Z",
		hasAnalysis: true,
	},
	{
		id: "6",
		title: "Калькулятор юнит-экономики для соло",
		description: "Один экран, без таблиц — ввод параметров и расчёт «сходится / нет»",
		score: 81,
		createdAt: "2026-05-23T16:00:00Z",
		hasAnalysis: true,
	},
	{
		id: "7",
		title: "Маркетплейс шаблонов лендингов от ИИ",
		description: "Промпт → готовая страница с CMS и базовой аналитикой",
		score: null,
		createdAt: "2026-05-29T08:00:00Z",
		hasAnalysis: false,
	},
	{
		id: "8",
		title: "Email-дайджест индустрии за 60 секунд",
		description: "ИИ-сжимает 200 источников до 5 пунктов, персонализация по нише",
		score: null,
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
		score: i.score!,
	}));
