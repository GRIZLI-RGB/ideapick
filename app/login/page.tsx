import { LoginPage } from "@/components/login/login-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Вход — Ideapick",
	description:
		"Войдите в Ideapick через Google или ссылку на почту, чтобы оценивать бизнес-идеи с помощью AI.",
};

export default function Page() {
	return <LoginPage />;
}
