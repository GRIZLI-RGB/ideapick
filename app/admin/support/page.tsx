import { TicketStatusBadge } from "@/components/support/ticket-status-badge";
import { formatDateTime } from "@/lib/admin/format";
import { ticketCardAccent } from "@/lib/support/constants";
import { adminListTickets } from "@/lib/support/service";
import type { SupportTicketStatus } from "@/lib/support/types";
import { ticketPreview } from "@/lib/support/utils";
import { Headphones } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_FILTERS: { value?: SupportTicketStatus; label: string }[] = [
	{ value: undefined, label: "Все" },
	{ value: "open", label: "Открытые" },
	{ value: "in_progress", label: "В работе" },
	{ value: "answered", label: "С ответом" },
	{ value: "closed", label: "Закрытые" },
];

const VALID_STATUSES = new Set(["open", "in_progress", "answered", "closed"]);

type PageProps = {
	searchParams: Promise<{ status?: string }>;
};

export default async function AdminSupportPage({ searchParams }: PageProps) {
	const params = await searchParams;
	const status =
		params.status && VALID_STATUSES.has(params.status)
			? (params.status as SupportTicketStatus)
			: undefined;

	const tickets = await adminListTickets(status);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-stone-50 sm:text-3xl">
					<Headphones className="size-7 text-amber-400/90 sm:size-8" />
					Поддержка
				</h1>
				<div className="flex flex-wrap gap-1.5">
					{STATUS_FILTERS.map((f) => {
						const isActive = status === f.value || (!status && !f.value);
						const href = f.value
							? `/admin/support?status=${f.value}`
							: "/admin/support";
						return (
							<Link
								key={f.label}
								href={href}
								className={`rounded-lg px-3 py-1.5 text-sm transition ${
									isActive
										? "bg-stone-800/80 text-stone-100"
										: "text-stone-400 hover:bg-stone-800/50 hover:text-stone-200"
								}`}
							>
								{f.label}
							</Link>
						);
					})}
				</div>
			</div>

			{tickets.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-stone-700 bg-stone-900/20 px-6 py-12 text-center">
					<p className="text-sm text-stone-500">Обращений нет</p>
				</div>
			) : (
				<ul className="space-y-3">
					{tickets.map((ticket) => (
						<li key={ticket.id}>
							<Link
								href={`/admin/support/${ticket.id}`}
								className={`group flex flex-col gap-2 rounded-2xl border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between ${ticketCardAccent(
									ticket.status,
									ticket.status === "open",
								)}`}
							>
								<div className="min-w-0">
									<div className="flex flex-wrap items-center gap-2">
										<span className="text-xs tabular-nums text-stone-500">
											#{ticket.number}
										</span>
										<TicketStatusBadge status={ticket.status} />
										<span className="truncate text-xs text-stone-500">
											{ticket.user.email}
										</span>
									</div>
									<p className="mt-1 truncate font-medium text-stone-100 group-hover:text-stone-50">
										{ticket.subject}
									</p>
									<p className="mt-0.5 truncate text-sm text-stone-500">
										{ticketPreview(ticket)}
									</p>
								</div>
								<span className="shrink-0 text-xs text-stone-600">
									{formatDateTime(ticket.updatedAt)}
								</span>
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
