import { LoginPage } from "@/components/login/login-page";
import { auth } from "@/lib/auth/auth";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: "Вход",
	description:
		"Войдите в Ideapick через Google или ссылку на почту, чтобы оценивать бизнес-идеи с помощью AI.",
	alternates: { canonical: "/login" },
};

export default async function Page() {
	// Уже авторизованным на странице входа делать нечего.
	const session = await auth.api.getSession({ headers: await headers() });
	if (session?.user) {
		redirect("/app/ideas");
	}
	return <LoginPage />;
}
