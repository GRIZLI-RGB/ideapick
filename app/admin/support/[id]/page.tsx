import { AdminTicketPanel } from "@/components/admin/admin-ticket-panel";
import { adminGetTicket } from "@/lib/support/service";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
	params: Promise<{ id: string }>;
};

export default async function AdminTicketPage({ params }: PageProps) {
	const { id } = await params;
	const ticket = await adminGetTicket(id);
	if (!ticket) notFound();

	return (
		<div className="space-y-4">
			<Link
				href="/admin/support"
				className="inline-flex w-fit items-center gap-1.5 rounded-lg px-1 py-1 text-sm text-stone-500 transition hover:text-stone-300"
			>
				<ArrowLeft className="size-4" />К списку
			</Link>
			<AdminTicketPanel ticket={ticket} />
		</div>
	);
}
