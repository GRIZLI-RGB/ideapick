/**
 * Живой адаптивный опрос для генерации идеи: ИИ ведёт диалог, задавая вопросы по
 * одному и подстраиваясь под ответы (в духе «Акинатора для идей»). Состояние
 * диалога — это транскрипт пар «вопрос → ответ». Типы и утилиты общие для
 * клиента (модалка-чат) и сервера (валидация + сборка промпта).
 */

/** Одна реплика диалога: вопрос ИИ и ответ пользователя. */
export type AnamnesisExchange = {
	question: string;
	answer: string;
};

/** Жёсткий потолок числа вопросов — защита от бесконечного диалога и расходов. */
export const ANAMNESIS_MAX_QUESTIONS = 8;

/** С этого числа ответов пользователю доступна кнопка «Подобрать идею». */
export const ANAMNESIS_MIN_QUESTIONS = 4;

/** Лимиты длины полей (защита промпта от мусора). */
export const ANAMNESIS_QUESTION_MAX = 300;
export const ANAMNESIS_ANSWER_MAX = 200;
/** Сколько вариантов ответа максимум показываем/принимаем. */
export const ANAMNESIS_OPTIONS_MAX = 5;

/**
 * Нормализует и валидирует транскрипт из запроса: массив пар «вопрос/ответ» с
 * непустыми строками, обрезанными до лимитов, не длиннее потолка вопросов.
 * Возвращает null при структурно некорректных данных.
 */
export function parseAnamnesisHistory(raw: unknown): AnamnesisExchange[] | null {
	if (!Array.isArray(raw)) return null;
	if (raw.length > ANAMNESIS_MAX_QUESTIONS) return null;

	const history: AnamnesisExchange[] = [];
	for (const item of raw) {
		if (!item || typeof item !== "object") return null;
		const { question, answer } = item as {
			question?: unknown;
			answer?: unknown;
		};
		if (typeof question !== "string" || typeof answer !== "string") {
			return null;
		}
		const q = question.trim().slice(0, ANAMNESIS_QUESTION_MAX);
		const a = answer.trim().slice(0, ANAMNESIS_ANSWER_MAX);
		if (!q || !a) return null;
		history.push({ question: q, answer: a });
	}
	return history;
}

/**
 * Собирает читаемый транскрипт диалога для подстановки в промпт. Пустой диалог
 * даёт явную пометку, чтобы модель задала первый вопрос.
 */
export function serializeAnamnesisDialog(history: AnamnesisExchange[]): string {
	if (history.length === 0) return "(диалог ещё не начат)";
	return history
		.map((e, i) => `Вопрос ${i + 1}: ${e.question}\nОтвет ${i + 1}: ${e.answer}`)
		.join("\n\n");
}
