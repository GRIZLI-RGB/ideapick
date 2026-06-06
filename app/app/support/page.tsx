import { SupportInbox } from "@/components/support/support-inbox";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Поддержка — Ideapick",
	description: "Обращения в поддержку Ideapick и ответы команды.",
};

export default function SupportPage() {
	return <SupportInbox />;
}
