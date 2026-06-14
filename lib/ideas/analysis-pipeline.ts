import "server-only";

import { generateAnalysis } from "@/lib/llm/analysis";
import {
	getAnalysisRow,
	markAnalysisFailed,
	saveAnalysisResult,
} from "@/lib/ideas/service";
import { refundAnalysisCharge } from "@/lib/wallet/service";

/**
 * Сколько ждать завершения фоновой генерации, прежде чем считать запуск
 * «зависшим». Генерация ограничена таймаутом DeepSeek (≈60с + ретрай), так что
 * 3 минуты — заведомо больше реального максимума и срабатывает только когда
 * фоновая задача не довыполнилась (например, процесс перезапустили).
 */
const STALE_ANALYSIS_MS = 3 * 60 * 1000;

type RunArgs = {
	userId: string;
	ideaId: string;
	idea: { id: string; userId: string; title: string; description: string };
	version: number;
	/** id списания за этот запуск — для возврата при сбое. */
	chargeTransactionId: string;
};

/**
 * Фоновая генерация отчёта: запускается через `after()` после ответа клиенту.
 * Успех — сохраняем отчёт (статус `ok`). Сбой — помечаем `failed` и возвращаем
 * деньги по списанию этого запуска (идемпотентно). Исключения не пробрасываем —
 * это фоновая задача, её некому ловить.
 */
export async function runAnalysisJob({
	userId,
	ideaId,
	idea,
	version,
	chargeTransactionId,
}: RunArgs): Promise<void> {
	try {
		const report = await generateAnalysis({ idea, version });
		await saveAnalysisResult({ userId, ideaId, report });
	} catch (error) {
		console.error("[analysis] фоновая генерация анализа упала:", error);
		await markAnalysisFailed({ userId, ideaId }).catch(() => {});
		try {
			await refundAnalysisCharge({ userId, chargeTransactionId });
		} catch (refundError) {
			console.error("[analysis] автовозврат после сбоя не прошёл:", refundError);
		}
	}
}

/**
 * «Сторож» зависших запусков: если идея давно в `pending` (фоновая задача не
 * довыполнилась — вероятно, рестарт процесса), помечает запуск `failed` и
 * возвращает деньги по сохранённому списанию. Вызывается лениво при чтении
 * статуса — отдельный планировщик не нужен. Возвращает true, если что-то сделал.
 */
export async function sweepStaleAnalysis({
	userId,
	ideaId,
}: {
	userId: string;
	ideaId: string;
}): Promise<boolean> {
	const row = await getAnalysisRow({ userId, ideaId });
	if (!row || row.status !== "pending") return false;
	if (Date.now() - row.updatedAt.getTime() < STALE_ANALYSIS_MS) return false;

	await markAnalysisFailed({ userId, ideaId });
	if (row.chargeTxId) {
		try {
			await refundAnalysisCharge({
				userId,
				chargeTransactionId: row.chargeTxId,
			});
		} catch (refundError) {
			console.error("[analysis] возврат при sweep не прошёл:", refundError);
		}
	}
	return true;
}
