export type Verdict = "do" | "test" | "wait" | "skip";

export type MockIdea = {
	title: string;
	desc: string;
	verdict: Verdict;
	score: number;
	tag: string;
};

export const VERDICTS: Record<
	Verdict,
	{ label: string; short: string; color: string; bg: string }
> = {
	do: {
		label: "Делать",
		short: "Делать",
		color: "text-emerald-700",
		bg: "bg-emerald-50",
	},
	test: {
		label: "Проверять",
		short: "Проверять",
		color: "text-amber-700",
		bg: "bg-amber-50",
	},
	wait: {
		label: "Отложить",
		short: "Отложить",
		color: "text-sky-700",
		bg: "bg-sky-50",
	},
	skip: {
		label: "Отказаться",
		short: "Отказ",
		color: "text-rose-700",
		bg: "bg-rose-50",
	},
};

export const MOCK_IDEAS: MockIdea[] = [
	{
		title: "Telegram-бот для квестов по городу",
		desc: "Геолокация, NFT-награды, командная игра",
		verdict: "test",
		score: 68,
		tag: "MVP",
	},
	{
		title: "Линтер промптов для VS Code",
		desc: "Локально проверяет качество промптов перед отправкой в LLM",
		verdict: "do",
		score: 84,
		tag: "DevTools",
	},
	{
		title: "Подписка на «осознанные расходы»",
		desc: "Анализ трат и еженедельный отчёт от ИИ",
		verdict: "wait",
		score: 51,
		tag: "FinTech",
	},
	{
		title: "Биржа ML-моделей под русский язык",
		desc: "Каталог дообученных моделей с бенчмарками",
		verdict: "do",
		score: 79,
		tag: "AI",
	},
	{
		title: "Сервис подбора подкастов под настроение",
		desc: "ИИ ловит настроение по тексту запроса",
		verdict: "skip",
		score: 28,
		tag: "Media",
	},
	{
		title: "Калькулятор юнит-экономики для соло",
		desc: "Один экран, без таблиц — ввод и вердикт",
		verdict: "do",
		score: 81,
		tag: "SaaS",
	},
	{
		title: "Маркетплейс шаблонов лендингов от ИИ",
		desc: "Промпт → готовая страница с CMS",
		verdict: "test",
		score: 64,
		tag: "AI",
	},
	{
		title: "Email-дайджест индустрии за 60 секунд",
		desc: "ИИ-сжимает 200 источников до 5 пунктов",
		verdict: "test",
		score: 71,
		tag: "Media",
	},
];
