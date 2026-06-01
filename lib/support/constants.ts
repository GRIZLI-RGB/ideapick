import type { SupportTicketStatus } from "@/lib/support/types";

export const SUPPORT_STATUS: Record<
	SupportTicketStatus,
	{ label: string; className: string }
> = {
	open: {
		label: "Открыт",
		className: "border-sky-500/35 bg-sky-500/10 text-sky-200",
	},
	in_progress: {
		label: "В работе",
		className: "border-amber-500/35 bg-amber-500/10 text-amber-200",
	},
	answered: {
		label: "Есть ответ",
		className: "border-emerald-500/35 bg-emerald-500/10 text-emerald-300",
	},
	closed: {
		label: "Закрыт",
		className: "border-stone-600/80 bg-stone-800/40 text-stone-400",
	},
};

/** Акцент карточки в списке — в тон бейджу статуса */
export function ticketCardAccent(
	status: SupportTicketStatus,
	needsAttention: boolean,
): string {
	const hover = "transition-colors";
	switch (status) {
		case "open":
			return `${hover} border-sky-500/25 bg-sky-500/[0.07] hover:border-sky-500/40 hover:bg-sky-500/12`;
		case "in_progress":
			return needsAttention
				? `${hover} border-amber-500/30 bg-amber-500/[0.09] hover:border-amber-500/45 hover:bg-amber-500/14`
				: `${hover} border-amber-500/18 bg-amber-500/[0.05] hover:border-amber-500/30 hover:bg-amber-500/10`;
		case "answered":
			return needsAttention
				? `${hover} border-emerald-500/30 bg-emerald-500/[0.09] hover:border-emerald-500/45 hover:bg-emerald-500/14`
				: `${hover} border-emerald-500/18 bg-emerald-500/[0.05] hover:border-emerald-500/30 hover:bg-emerald-500/10`;
		case "closed":
			return `${hover} border-stone-800/50 bg-stone-900/25 hover:border-stone-700/70 hover:bg-stone-800/45`;
	}
}
