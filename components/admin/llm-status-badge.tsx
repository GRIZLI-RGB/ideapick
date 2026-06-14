const STYLES: Record<string, string> = {
	ok: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
	error: "border-rose-500/30 bg-rose-500/10 text-rose-300",
};

const LABELS: Record<string, string> = {
	ok: "Успех",
	error: "Ошибка",
};

export function LlmStatusBadge({ status }: { status: string }) {
	return (
		<span
			className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
				STYLES[status] ?? STYLES.error
			}`}
		>
			{LABELS[status] ?? status}
		</span>
	);
}
