import { Newspaper, Plus } from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/admin/format";
import { listArticlesAdmin } from "@/lib/blog/service";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
	const items = await listArticlesAdmin();
	const published = items.filter((i) => i.status === "published").length;

	const statCards = [
		{ label: "Опубликовано", value: published, accent: "text-emerald-400" },
		{
			label: "Черновики",
			value: items.length - published,
			accent: "text-stone-300",
		},
		{ label: "Всего", value: items.length, accent: "text-stone-300" },
	];

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-stone-50 sm:text-3xl">
					<Newspaper className="size-7 text-amber-400/90 sm:size-8" />
					Блог
				</h1>
				<div className="flex items-center gap-2">
					{statCards.map((s) => (
						<div
							key={s.label}
							className="rounded-xl border border-stone-800/60 bg-stone-900/30 px-4 py-2 text-center"
						>
							<p className={`text-lg font-bold tabular-nums ${s.accent}`}>
								{s.value}
							</p>
							<p className="text-[11px] text-stone-500">{s.label}</p>
						</div>
					))}
				</div>
			</div>

			<div className="flex justify-end">
				<Link
					href="/admin/articles/new"
					className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-400"
				>
					<Plus className="size-4" />
					Новая статья
				</Link>
			</div>

			<div className="overflow-x-auto rounded-2xl border border-stone-800/60 bg-stone-900/30">
				<table className="w-full min-w-[640px] text-left text-sm">
					<thead>
						<tr className="border-b border-stone-800/60 text-xs text-stone-500">
							<th className="px-4 py-3 font-medium">Статья</th>
							<th className="px-4 py-3 font-medium">Статус</th>
							<th className="px-4 py-3 font-medium">Обновлена</th>
						</tr>
					</thead>
					<tbody>
						{items.length === 0 ? (
							<tr>
								<td
									colSpan={3}
									className="px-4 py-10 text-center text-stone-500"
								>
									Пока нет статей — создайте первую
								</td>
							</tr>
						) : (
							items.map((item) => (
								<tr
									key={item.id}
									className="border-b border-stone-800/40 last:border-0 hover:bg-stone-800/30"
								>
									<td className="max-w-md px-4 py-3">
										<Link
											href={`/admin/articles/${item.id}`}
											className="block"
										>
											<p className="truncate font-medium text-stone-200 hover:text-amber-300">
												{item.title}
											</p>
											<p className="truncate font-mono text-[11px] text-stone-500">
												/blog/{item.slug}
												{item.category ? ` · ${item.category}` : ""} ·{" "}
												{item.readingMinutes} мин
											</p>
										</Link>
									</td>
									<td className="px-4 py-3">
										{item.status === "published" ? (
											<span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">
												Опубликована
											</span>
										) : (
											<span className="inline-flex items-center rounded-full border border-stone-700 bg-stone-800/60 px-2 py-0.5 text-xs text-stone-400">
												Черновик
											</span>
										)}
									</td>
									<td className="px-4 py-3 text-xs text-stone-500">
										{formatDateTime(item.updatedAt)}
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
