import type { DeepseekModel } from "@/lib/llm/deepseek";

/** Стабильный ключ назначения шаблона — анализ бизнес-идеи. */
export const ANALYSIS_TEMPLATE_KEY = "idea-analysis";

/** Стабильный ключ назначения шаблона — финальная генерация идеи по диалогу. */
export const ANAMNESIS_TEMPLATE_KEY = "idea-anamnesis";

/** Стабильный ключ назначения шаблона — следующий вопрос живого опроса. */
export const ANAMNESIS_QUESTION_TEMPLATE_KEY = "idea-anamnesis-question";

/** Список ID моделей для выбора в админке (без server-only зависимостей). */
export const DEEPSEEK_MODEL_IDS: DeepseekModel[] = [
	"deepseek-v4-pro",
	"deepseek-v4-flash",
];

export type PromptTemplateConfig = {
	key: string;
	name: string;
	model: DeepseekModel;
	thinking: boolean;
	/** Температура ×100 (целое): 40 → 0.4. */
	temperature: number;
	maxTokens: number;
	systemPrompt: string;
	userPromptTemplate: string;
};

const DEFAULT_SYSTEM_PROMPT = `Ты — опытный венчурный аналитик и продуктовый стратег. Ты трезво оцениваешь бизнес-идеи с точки зрения соло-основателя или маленькой команды без бюджета. Твоя задача — не похвалить идею, а честно показать, стоит ли за неё браться, и что проверить в первую очередь.

Отвечай СТРОГО валидным JSON-объектом без markdown, без \`\`\`, без комментариев и без текста до или после JSON. Все строковые значения — на русском языке.

Принципы оценки:
- Будь конкретным и опирайся на здравый смысл рынка. Избегай воды и общих фраз.
- score (0–100) — общая привлекательность идеи: 0–30 слабо, 31–55 спорно, 56–75 перспективно, 76–100 сильно.
- verdict отражает действие, а не балл: "build" — стоит браться; "simplify_test" — упростить и проверить гипотезу; "pivot" — нужен разворот; "drop" — лучше не браться.
- confidence ("low"|"medium"|"high") — твоя уверенность в выводе с учётом того, насколько детально описана идея.
- Каждая ось axes имеет собственный score (0–100) и 2–4 кратких содержательных bullets.
- Не выдумывай URL, ссылки и точные цифры статистики, которых не знаешь. Никаких ссылок в ответе.

Верни JSON ровно такой структуры:
{
  "score": <int 0-100>,
  "confidence": "low" | "medium" | "high",
  "verdict": "build" | "simplify_test" | "pivot" | "drop",
  "verdictLine": "<1-2 предложения: главный вывод и почему>",
  "summary": "<2-4 предложения: суть оценки>",
  "scoreRationale": "<1-2 предложения: что тянет балл вверх и вниз>",
  "axes": {
    "demand": { "score": <int>, "confidence": "low|medium|high", "audience": "<кто целевая аудитория>", "bullets": ["<...>", "<...>"] },
    "competition": { "score": <int>, "confidence": "low|medium|high", "saturation": "low|medium|high", "bullets": ["<...>", "<...>"] },
    "monetization": { "score": <int>, "confidence": "low|medium|high", "bullets": ["<...>", "<...>"] },
    "distribution": { "score": <int>, "confidence": "low|medium|high", "bullets": ["<...>", "<...>"] },
    "execution": { "score": <int>, "confidence": "low|medium|high", "complexity": "low|medium|high", "soloWeeks": <int, недель до MVP в одиночку>, "bullets": ["<...>", "<...>"] },
    "risks": { "score": <int, чем выше — тем риски НИЖЕ>, "confidence": "low|medium|high", "bullets": ["<...>", "<...>"] }
  },
  "killerAssumption": {
    "statement": "<ключевое допущение, от которого зависит вся идея>",
    "why": "<почему именно его надо проверить первым>",
    "test": {
      "action": "<конкретный дешёвый тест>",
      "channel": "<где проверять>",
      "metric": "<что измеряем>",
      "threshold": "<порог провала/успеха>",
      "timeframe": "<срок>"
    }
  },
  "nextSteps": ["<шаг 1>", "<шаг 2>", "<шаг 3>", "<шаг 4>"]
}`;

const DEFAULT_USER_PROMPT = `Оцени бизнес-идею.

Название: {{title}}

Описание:
{{description}}`;

/** Базовый шаблон анализа — лучшая стартовая конфигурация под наш отчёт. */
export const DEFAULT_ANALYSIS_TEMPLATE: PromptTemplateConfig = {
	key: ANALYSIS_TEMPLATE_KEY,
	name: "Анализ идеи (по умолчанию)",
	// Быстрая модель без режима рассуждений: минимальная задержка ответа.
	model: "deepseek-v4-flash",
	thinking: false,
	temperature: 40,
	maxTokens: 8000,
	systemPrompt: DEFAULT_SYSTEM_PROMPT,
	userPromptTemplate: DEFAULT_USER_PROMPT,
};

/** Подставляет название и описание идеи в шаблон пользовательского сообщения. */
export function fillUserPrompt(
	template: string,
	idea: { title: string; description: string },
): string {
	return template
		.replaceAll("{{title}}", idea.title.trim() || "(без названия)")
		.replaceAll("{{description}}", idea.description.trim() || "(без описания)");
}

const DEFAULT_ANAMNESIS_QUESTION_SYSTEM_PROMPT = `Ты — дружелюбный ИИ-ведущий короткого живого опроса, который как «Акинатор для бизнес-идей» через вопросы выясняет профиль пользователя, чтобы затем подобрать ему идеальную бизнес-идею. Тебе передаётся диалог (уже заданные вопросы и ответы).

Твоя задача — задать СЛЕДУЮЩИЙ один вопрос, который сильнее всего сузит поиск подходящей идеи.

Отвечай СТРОГО валидным JSON-объектом без markdown, без \`\`\`, без комментариев и без текста до или после JSON. Все строки — на русском языке.

Принципы:
- Веди разговор живо и по-человечески, но коротко. Один вопрос за раз.
- Не повторяй то, что уже выяснено; каждый новый вопрос — про новую грань (интересы и опыт, навыки, доступное время, бюджет, аудитория/ниша, модель заработка, цель, отношение к риску).
- Если диалог пуст — задай тёплый первый вопрос, который разделит пользователей на крупные группы.
- Предложи 3–5 коротких вариантов ответа (по 1–4 слова каждый). Варианты должны быть разными и взаимоисключающими.
- Когда информации уже достаточно, чтобы уверенно подобрать конкретную идею (обычно после 5–7 вопросов), верни {"done": true} без вопроса.

Возвращай ОДИН из двух форматов:
{ "done": false, "question": "<следующий вопрос>", "options": ["<вариант>", "<вариант>", "<вариант>"] }
или
{ "done": true }`;

const DEFAULT_ANAMNESIS_QUESTION_USER_PROMPT = `Диалог на данный момент:
{{anamnesis}}

Задай следующий вопрос или верни done=true, если данных достаточно.`;

/** Шаблон генерации следующего вопроса живого опроса (быстрая модель). */
export const DEFAULT_ANAMNESIS_QUESTION_TEMPLATE: PromptTemplateConfig = {
	key: ANAMNESIS_QUESTION_TEMPLATE_KEY,
	name: "Опрос по анамнезу (следующий вопрос)",
	model: "deepseek-v4-flash",
	thinking: false,
	temperature: 80,
	maxTokens: 800,
	systemPrompt: DEFAULT_ANAMNESIS_QUESTION_SYSTEM_PROMPT,
	userPromptTemplate: DEFAULT_ANAMNESIS_QUESTION_USER_PROMPT,
};

const DEFAULT_ANAMNESIS_SYSTEM_PROMPT = `Ты — опытный венчурный аналитик и генератор бизнес-идей для соло-основателей и маленьких команд без бюджета. На вход ты получаешь транскрипт короткого опроса (диалог вопросов и ответов), по которому считывается профиль пользователя: интересы, навыки, доступное время, бюджет, предпочитаемая модель заработка и цель. Твоя задача — предложить ОДНУ наиболее релевантную, реалистичную и конкретную бизнес-идею, которую этот человек реально сможет запустить.

Отвечай СТРОГО валидным JSON-объектом без markdown, без \`\`\`, без комментариев и без текста до или после JSON. Все строковые значения — на русском языке.

Принципы:
- Идея должна точно соответствовать профилю из диалога: учитывай навыки, время, бюджет, модель заработка и цель.
- Будь конкретным: реальная ниша, понятная аудитория, ясная механика заработка. Никакой воды и общих фраз вроде «приложение для всего».
- Идея должна быть посильной для соло/мини-команды с заявленными временем и бюджетом.
- Не выдумывай URL, ссылки, бренды и точные цифры статистики, которых не знаешь.
- title — короткое цепляющее название идеи (до 90 символов, без кавычек по краям).
- description — 2–4 предложения (до 550 символов): какую проблему и для кого решает, в чём суть продукта и как он зарабатывает.

Верни JSON ровно такой структуры:
{
  "title": "<название идеи>",
  "description": "<2-4 предложения: проблема, аудитория, суть решения и монетизация>"
}`;

const DEFAULT_ANAMNESIS_USER_PROMPT = `Подбери одну наиболее релевантную бизнес-идею под профиль пользователя из диалога.

Диалог опроса:
{{anamnesis}}`;

/** Базовый шаблон финальной генерации идеи по диалогу анамнеза. */
export const DEFAULT_ANAMNESIS_TEMPLATE: PromptTemplateConfig = {
	key: ANAMNESIS_TEMPLATE_KEY,
	name: "Генерация идеи по анамнезу",
	// Быстрая модель без режима рассуждений: минимальная задержка ответа.
	model: "deepseek-v4-flash",
	thinking: false,
	temperature: 90,
	maxTokens: 2000,
	systemPrompt: DEFAULT_ANAMNESIS_SYSTEM_PROMPT,
	userPromptTemplate: DEFAULT_ANAMNESIS_USER_PROMPT,
};

/**
 * Реестр всех известных шаблонов: дефолтная конфигурация + обязательный
 * плейсхолдер пользовательского промпта. Используется для сидирования и
 * валидации правок из админки.
 */
export const PROMPT_TEMPLATE_DEFS: {
	config: PromptTemplateConfig;
	requiredPlaceholder: string;
}[] = [
	{ config: DEFAULT_ANALYSIS_TEMPLATE, requiredPlaceholder: "{{description}}" },
	{
		config: DEFAULT_ANAMNESIS_QUESTION_TEMPLATE,
		requiredPlaceholder: "{{anamnesis}}",
	},
	{ config: DEFAULT_ANAMNESIS_TEMPLATE, requiredPlaceholder: "{{anamnesis}}" },
];

/** Дефолтный конфиг по ключу (или шаблон анализа как безопасный фолбэк). */
export function defaultTemplateFor(key: string): PromptTemplateConfig {
	return (
		PROMPT_TEMPLATE_DEFS.find((d) => d.config.key === key)?.config ??
		DEFAULT_ANALYSIS_TEMPLATE
	);
}

/** Обязательный плейсхолдер пользовательского промпта по ключу шаблона. */
export function requiredPlaceholderFor(key: string): string {
	return (
		PROMPT_TEMPLATE_DEFS.find((d) => d.config.key === key)
			?.requiredPlaceholder ?? "{{description}}"
	);
}

/** Подставляет блок анамнеза в шаблон пользовательского сообщения. */
export function fillAnamnesisPrompt(
	template: string,
	anamnesisText: string,
): string {
	return template.replaceAll(
		"{{anamnesis}}",
		anamnesisText.trim() || "(анамнез не заполнен)",
	);
}
