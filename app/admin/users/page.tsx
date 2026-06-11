import { AdminPagination } from "@/components/admin/pagination";
import { formatDateTime, formatRub } from "@/lib/admin/format";
import { ADMIN_PAGE_SIZE, listUsers } from "@/lib/admin/service";
import { Search, Users } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

type PageProps = {
	searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function AdminUsersPage({ searchParams }: PageProps) {
	const params = await searchParams;
	const query = params.q?.trim() || undefined;
	const page = Math.max(1, Number(params.page) || 1);

	const { users, total } = await listUsers({ query, page });

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-stone-50 sm:text-3xl">
					<Users className="size-7 text-amber-400/90 sm:size-8" />
					Пользователи
				</h1>
				<form method="get" className="relative">
					<Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-500" />
					<input
						type="search"
						name="q"
						defaultValue={query ?? ""}
						placeholder="Поиск по email или имени"
						className="w-full rounded-xl border border-stone-700 bg-stone-950/60 py-2 pr-3 pl-9 text-sm text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20 sm:w-72"
					/>
				</form>
			</div>

			<div className="overflow-x-auto rounded-2xl border border-stone-800/60 bg-stone-900/30">
				<table className="w-full min-w-[640px] text-left text-sm">
					<thead>
						<tr className="border-b border-stone-800/60 text-xs text-stone-500">
							<th className="px-4 py-3 font-medium">Пользователь</th>
							<th className="px-4 py-3 font-medium">Баланс</th>
							<th className="px-4 py-3 font-medium">Идеи</th>
							<th className="px-4 py-3 font-medium">Статус</th>
							<th className="px-4 py-3 font-medium">Регистрация</th>
						</tr>
					</thead>
					<tbody>
						{users.length === 0 ? (
							<tr>
								<td
									colSpan={5}
									className="px-4 py-10 text-center text-stone-500"
								>
									Никого не найдено
								</td>
							</tr>
						) : (
							users.map((u) => (
								<tr
									key={u.id}
									className="border-b border-stone-800/40 last:border-0 hover:bg-stone-800/30"
								>
									<td className="px-4 py-3">
										<Link
											href={`/admin/users/${u.id}`}
											className="block hover:text-amber-300"
										>
											<span className="font-medium text-stone-200">
												{u.email}
											</span>
											<span className="block text-xs text-stone-500">
												{u.name}
											</span>
										</Link>
									</td>
									<td className="px-4 py-3 tabular-nums text-stone-300">
										{formatRub(u.balance)}
									</td>
									<td className="px-4 py-3 tabular-nums text-stone-400">
										{u.ideasCount}
									</td>
									<td className="px-4 py-3">
										<div className="flex flex-wrap gap-1.5">
											{u.role === "admin" ? (
												<span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-200">
													Админ
												</span>
											) : null}
											{u.banned ? (
												<span className="rounded-full border border-red-500/35 bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-300">
													Забанен
												</span>
											) : null}
											{u.role !== "admin" && !u.banned ? (
												<span className="text-xs text-stone-500">—</span>
											) : null}
										</div>
									</td>
									<td className="px-4 py-3 text-xs text-stone-500">
										{formatDateTime(u.createdAt)}
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			<AdminPagination
				page={page}
				total={total}
				pageSize={ADMIN_PAGE_SIZE}
				basePath="/admin/users"
				searchParams={{ q: query }}
			/>
		</div>
	);
}
