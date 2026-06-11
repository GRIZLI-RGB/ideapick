"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { YM_COUNTER_ID } from "@/components/site/yandex-metrika-id";

declare global {
	interface Window {
		ym?: (id: number, method: string, ...args: unknown[]) => void;
	}
}

/**
 * Отправка просмотров при клиентской навигации App Router —
 * сам счётчик фиксирует только первую загрузку страницы.
 */
export function YandexMetrikaHits() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const isFirstRender = useRef(true);

	useEffect(() => {
		// Первый просмотр отправляет init счётчика — не дублируем
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		const query = searchParams.toString();
		window.ym?.(
			YM_COUNTER_ID,
			"hit",
			pathname + (query ? `?${query}` : ""),
		);
	}, [pathname, searchParams]);

	return null;
}
