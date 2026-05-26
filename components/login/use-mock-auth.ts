"use client";

import { useCallback, useState } from "react";

export function useMockAuth() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState<"google" | "magic" | null>(null);
	const [sent, setSent] = useState(false);

	const signInWithGoogle = useCallback(async () => {
		setLoading("google");
		await new Promise((r) => setTimeout(r, 900));
		setLoading(null);
	}, []);

	const sendMagicLink = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (!email.trim()) return;
			setLoading("magic");
			await new Promise((r) => setTimeout(r, 1100));
			setLoading(null);
			setSent(true);
		},
		[email],
	);

	const resetMagicLink = useCallback(() => {
		setSent(false);
		setEmail("");
	}, []);

	return {
		email,
		setEmail,
		loading,
		sent,
		signInWithGoogle,
		sendMagicLink,
		resetMagicLink,
	};
}
