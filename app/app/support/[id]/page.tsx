import { TicketThread } from "@/components/support/ticket-thread";
import type { Metadata } from "next";

type PageProps = {
	params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
	title: "Обращение — Ideapick",
	description: "Переписка по обращению в поддержку Ideapick.",
};

export default async function SupportTicketPage({ params }: PageProps) {
	const { id } = await params;
	return <TicketThread ticketId={id} />;
}
