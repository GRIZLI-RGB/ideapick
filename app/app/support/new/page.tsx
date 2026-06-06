import { NewTicketForm } from "@/components/support/new-ticket-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Новое обращение — Ideapick",
	description: "Создайте новое обращение в поддержку Ideapick.",
};

export default function NewSupportTicketPage() {
	return <NewTicketForm />;
}
