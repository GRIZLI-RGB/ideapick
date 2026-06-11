const STYLES: Record<string, string> = {
	succeeded: "border-emerald-500/35 bg-emerald-500/10 text-emerald-300",
	pending: "border-amber-500/35 bg-amber-500/10 text-amber-200",
	canceled: "border-stone-600/80 bg-stone-800/40 text-stone-400",
};

const LABELS: Record<string, string> = {
	succeeded: "Успешен",
	pending: "Ожидает",
	canceled: "Отменён",
};

export function PaymentStatusBadge({ status }: { status: string }) {
	return (
		<span
			className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
				STYLES[status] ?? STYLES.pending
			}`}
		>
			{LABELS[status] ?? status}
		</span>
	);
}
