"use client";

import { useCallback, useEffect, useState } from "react";
import { signIn } from "@/lib/auth/client";

const DEFAULT_CALLBACK = "/app/ideas";
const TELEGRAM_WIDGET_SRC = "https://telegram.org/js/telegram-widget.js?22";

const TELEGRAM_BOT_ID = process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID;

type TelegramAuthData = Record<string, string | number>;

type TelegramLogin = {
	auth: (
		options: { bot_id: string; request_access?: string; lang?: string },
		callback: (data: TelegramAuthData | false) => void,
	) => void;
};

type LoadingProvider = "google" | "yandex" | "telegram" | "magic";

/** Берём callbackUrl из query, но пускаем только внутренние пути (защита от open redirect). */
function resolveCallbackUrl(): string {
	if (typeof window === "undefined") return DEFAULT_CALLBACK;
	const raw = new URLSearchParams(window.location.search).get("callbackUrl");
	if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
	return DEFAULT_CALLBACK;
}

export function useAuth() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState<LoadingProvider | null>(null);
	const [sent, setSent] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Скрипт Telegram Login Widget грузим один раз и только если бот настроен.
	useEffect(() => {
		if (!TELEGRAM_BOT_ID) return;
		if (document.querySelector(`script[src="${TELEGRAM_WIDGET_SRC}"]`)) {
			return;
		}
		const script = document.createElement("script");
		script.src = TELEGRAM_WIDGET_SRC;
		script.async = true;
		document.body.appendChild(script);
	}, []);

	const signInWithGoogle = useCallback(async () => {
		setError(null);
		setLoading("google");
		const { error: googleError } = await signIn.social({
			provider: "google",
			callbackURL: resolveCallbackUrl(),
		});
		// При успехе происходит редирект на Google — loading не сбрасываем.
		if (googleError) {
			setLoading(null);
			setError("Не удалось войти через Google. Попробуйте ещё раз.");
		}
	}, []);

	const signInWithYandex = useCallback(async () => {
		setError(null);
		setLoading("yandex");
		const { error: yandexError } = await signIn.oauth2({
			providerId: "yandex",
			callbackURL: resolveCallbackUrl(),
		});
		// При успехе происходит редирект на Yandex — loading не сбрасываем.
		if (yandexError) {
			setLoading(null);
			setError("Не удалось войти через Yandex. Попробуйте ещё раз.");
		}
	}, []);

	const signInWithTelegram = useCallback(() => {
		const telegramLogin = (
			window as unknown as { Telegram?: { Login?: TelegramLogin } }
		).Telegram?.Login;
		if (!TELEGRAM_BOT_ID || !telegramLogin) {
			setError("Вход через Telegram сейчас недоступен.");
			return;
		}
		setError(null);
		setLoading("telegram");
		telegramLogin.auth(
			{ bot_id: TELEGRAM_BOT_ID, request_access: "write" },
			(data) => {
				if (!data) {
					setLoading(null);
					setError("Не удалось войти через Telegram.");
					return;
				}
				const params = new URLSearchParams();
				for (const [key, value] of Object.entries(data)) {
					params.set(key, String(value));
				}
				params.set("callbackURL", resolveCallbackUrl());
				// Уходим на серверный эндпоинт: он проверит подпись, заведёт
				// сессию и вернёт пользователя на callbackURL.
				window.location.href = `/api/auth/telegram/callback?${params.toString()}`;
			},
		);
	}, []);

	const sendMagicLink = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			const value = email.trim();
			if (!value) return;
			setError(null);
			setLoading("magic");
			const { error: magicError } = await signIn.magicLink({
				email: value,
				callbackURL: resolveCallbackUrl(),
			});
			setLoading(null);
			if (magicError) {
				setError(
					"Не удалось отправить ссылку. Проверьте email и попробуйте снова.",
				);
				return;
			}
			setSent(true);
		},
		[email],
	);

	const resetMagicLink = useCallback(() => {
		setSent(false);
		setEmail("");
		setError(null);
	}, []);

	return {
		email,
		setEmail,
		loading,
		sent,
		error,
		signInWithGoogle,
		signInWithYandex,
		signInWithTelegram,
		sendMagicLink,
		resetMagicLink,
	};
}
