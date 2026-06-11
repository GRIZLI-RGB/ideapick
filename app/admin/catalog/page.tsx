import {
	CatalogDeleteButton,
	CatalogManager,
} from "@/components/admin/catalog-manager";
import { AdminPagination } from "@/components/admin/pagination";
import { formatDateTime } from "@/lib/admin/format";
import { ADMIN_PAGE_SIZE } from "@/lib/admin/service";
import { getCatalogStats, listCatalogIdeas } from "@/lib/ideas/catalog";
import { BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

type PageProps = {
	searchParams: Promise<{ page?: string }>;
};

export default async function AdminCatalogPage({ searchParams }: PageProps) {
	const params = await searchParams;
	const page = Math.max(1, Number(params.page) || 1);

	const [stats, { items, total }] = await Promise.all([
		getCatalogStats(),
		listCatalogIdeas({ page, pageSize: ADMIN_PAGE_SIZE }),
	]);

	const statCards = [
		{ label: "Свободны", value: stats.available, accent: "text-emerald-400" },
		{ label: "Выданы", value: stats.issued, accent: "text-stone-300" },
		{ label: "Всего", value: stats.total, accent: "text-stone-300" },
	];

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-stone-50 sm:text-3xl">
					<BookOpen className="size-7 text-amber-400/90 sm:size-8" />
					Каталог идей
				</h1>
				<div className="flex gap-2">
					{statCards.map((s) => (
						<div
							key={s.label}
							className="rounded-xl border border-stone-800/60 bg-stone-900/30 px-4 py-2 text-center"
						>
							<p
								className={`text-lg font-bold tabular-nums ${s.accent}`}
							>
								{s.value}
							</p>
							<p className="text-[11px] text-stone-500">{s.label}</p>
						</div>
					))}
				</div>
			</div>

			<CatalogManager />

			<div className="overflow-x-auto rounded-2xl border border-stone-800/60 bg-stone-900/30">
				<table className="w-full min-w-[640px] text-left text-sm">
					<thead>
						<tr className="border-b border-stone-800/60 text-xs text-stone-500">
							<th className="px-4 py-3 font-medium">Идея</th>
							<th className="px-4 py-3 font-medium">Статус</th>
							<th className="px-4 py-3 font-medium">Добавлена</th>
							<th className="px-4 py-3 font-medium sr-only">
								Действия
							</th>
						</tr>
					</thead>
					<tbody>
						{items.length === 0 ? (
							<tr>
								<td
									colSpan={4}
									className="px-4 py-10 text-center text-stone-500"
								>
									Пул пуст — добавьте идеи вручную или
									импортируйте JSON
								</td>
							</tr>
						) : (
							items.map((item) => {
								const issued = item.issuedAt !== null;
								return (
									<tr
										key={item.id}
										className="border-b border-stone-800/40 last:border-0 hover:bg-stone-800/30"
									>
										<td className="max-w-md px-4 py-3">
											<p className="truncate font-medium text-stone-200">
												{item.title}
											</p>
											<p className="truncate text-xs text-stone-500">
												{item.description}
											</p>
										</td>
										<td className="px-4 py-3">
											{issued ? (
												<div>
													<span className="inline-flex items-center rounded-full border border-stone-700 bg-stone-800/60 px-2 py-0.5 text-xs text-stone-400">
														Выдана
													</span>
													<p className="mt-1 text-[11px] text-stone-500">
														{item.issuedToEmail ??
															"аккаунт удалён"}{" "}
														·{" "}
														{formatDateTime(
															item.issuedAt!,
														)}
													</p>
												</div>
											) : (
												<span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">
													Свободна
												</span>
											)}
										</td>
										<td className="px-4 py-3 text-xs text-stone-500">
											{formatDateTime(item.createdAt)}
										</td>
										<td className="px-4 py-3 text-right">
											{!issued ? (
												<CatalogDeleteButton
													id={item.id}
												/>
											) : null}
										</td>
									</tr>
								);
							})
						)}
					</tbody>
				</table>
			</div>

			<AdminPagination
				page={page}
				total={total}
				pageSize={ADMIN_PAGE_SIZE}
				basePath="/admin/catalog"
				searchParams={{}}
			/>
		</div>
	);
}
