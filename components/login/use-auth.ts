"use client";

import { useCallback, useState } from "react";
import { signIn } from "@/lib/auth/client";

const DEFAULT_CALLBACK = "/app/ideas";

/** Берём callbackUrl из query, но пускаем только внутренние пути (защита от open redirect). */
function resolveCallbackUrl(): string {
	if (typeof window === "undefined") return DEFAULT_CALLBACK;
	const raw = new URLSearchParams(window.location.search).get("callbackUrl");
	if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
	return DEFAULT_CALLBACK;
}

export function useAuth() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState<"google" | "magic" | null>(null);
	const [sent, setSent] = useState(false);
	const [error, setError] = useState<string | null>(null);

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
		sendMagicLink,
		resetMagicLink,
	};
}
