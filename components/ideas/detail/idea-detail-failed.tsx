"use client";

import { PANEL } from "@/components/ideas/detail/idea-detail-shared";
import { AlertTriangle, RefreshCw } from "lucide-react";

type IdeaDetailFailedProps = {
	/** Повторный запуск анализа (спишет стоимость заново). */
	onRetry: () => void;
};

/** Состояние неуспешного анализа: обращение к нейросети не удалось. */
export function IdeaDetailFailed({ onRetry }: IdeaDetailFailedProps) {
	return (
		<div
			className={`relative overflow-hidden ${PANEL} flex min-h-76 items-center justify-center px-4 py-10`}
		>
			<div className="w-full max-w-sm rounded-2xl border border-stone-700/60 bg-stone-900/80 p-6 text-center shadow-2xl shadow-black/40">
				<div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-rose-500/10 ring-1 ring-rose-500/20">
					<AlertTriangle className="size-5 text-rose-400" />
				</div>
				<h2 className="mt-3.5 text-pretty text-base font-semibold leading-snug text-stone-100">
					Анализ не удался
				</h2>
				<p className="mt-1.5 text-sm text-stone-500">
					Не получилось обратиться к нейросети. Повторный запуск спишет
					стоимость заново. Если ошибка повторяется — напишите в поддержку, мы
					вернём средства.
				</p>
				<button
					type="button"
					onClick={onRetry}
					className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
				>
					<RefreshCw className="size-4" />
					Попробовать снова
				</button>
			</div>
		</div>
	);
}
