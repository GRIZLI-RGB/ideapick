import { NewTicketForm } from "@/components/support/new-ticket-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Новое обращение — Ideapick",
};

export default function NewSupportTicketPage() {
	return <NewTicketForm />;
}
