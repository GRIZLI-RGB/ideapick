import Link from "next/link";

type AdminPaginationProps = {
	page: number;
	total: number;
	pageSize: number;
	/** Базовый путь, например /admin/users */
	basePath: string;
	/** Доп. query-параметры, сохраняемые при переключении страниц */
	searchParams?: Record<string, string | undefined>;
};

function pageHref(
	basePath: string,
	page: number,
	searchParams?: Record<string, string | undefined>,
): string {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(searchParams ?? {})) {
		if (value) params.set(key, value);
	}
	if (page > 1) params.set("page", String(page));
	const qs = params.toString();
	return qs ? `${basePath}?${qs}` : basePath;
}

export function AdminPagination({
	page,
	total,
	pageSize,
	basePath,
	searchParams,
}: AdminPaginationProps) {
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	if (totalPages <= 1) return null;

	const linkCls =
		"rounded-lg border border-stone-700/80 px-3 py-1.5 text-sm text-stone-300 transition hover:border-stone-600 hover:bg-stone-800/50 hover:text-stone-100";
	const disabledCls =
		"rounded-lg border border-stone-800/60 px-3 py-1.5 text-sm text-stone-600";

	return (
		<div className="flex items-center justify-between gap-3 pt-4">
			{page > 1 ? (
				<Link href={pageHref(basePath, page - 1, searchParams)} className={linkCls}>
					← Назад
				</Link>
			) : (
				<span className={disabledCls}>← Назад</span>
			)}
			<span className="text-xs tabular-nums text-stone-500">
				Стр. {page} из {totalPages} · всего {total}
			</span>
			{page < totalPages ? (
				<Link href={pageHref(basePath, page + 1, searchParams)} className={linkCls}>
					Вперёд →
				</Link>
			) : (
				<span className={disabledCls}>Вперёд →</span>
			)}
		</div>
	);
}
