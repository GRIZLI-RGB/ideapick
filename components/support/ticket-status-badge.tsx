import { SUPPORT_STATUS } from "@/lib/support/constants";
import type { SupportTicketStatus } from "@/lib/support/types";

type TicketStatusBadgeProps = {
	status: SupportTicketStatus;
	showPulse?: boolean;
};

const PULSE_DOT: Partial<
	Record<
		SupportTicketStatus,
		{ ping: string; solid: string }
	>
> = {
	in_progress: {
		ping: "bg-amber-400/70",
		solid: "bg-amber-400",
	},
	answered: {
		ping: "bg-emerald-400/70",
		solid: "bg-emerald-400",
	},
};

export function TicketStatusBadge({ status, showPulse = false }: TicketStatusBadgeProps) {
	const meta = SUPPORT_STATUS[status];
	const pulse = showPulse ? PULSE_DOT[status] : undefined;

	return (
		<span
			className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.className}`}
		>
			{pulse ? (
				<span className="relative flex size-2" aria-hidden>
					<span
						className={`absolute inline-flex size-full animate-ping rounded-full opacity-75 ${pulse.ping}`}
					/>
					<span
						className={`relative inline-flex size-2 rounded-full ${pulse.solid}`}
					/>
				</span>
			) : null}
			{meta.label}
		</span>
	);
}