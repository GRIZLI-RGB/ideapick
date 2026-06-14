import { LlmStatusBadge } from "@/components/admin/llm-status-badge";
import { AdminPagination } from "@/components/admin/pagination";
import {
	formatDateTime,
	formatTokens,
	formatUsd,
} from "@/lib/admin/format";
import { ADMIN_PAGE_SIZE, listLlmRequests } from "@/lib/admin/service";
import { Bot } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_FILTERS = [
	{ value: undefined, label: "Все" },
	{ value: "ok", label: "Успешные" },
	{ value: "error", label: "Ошибки" },
] as const;

type PageProps = {
	searchParams: Promise<{ status?: string; page?: string }>;
};

export default async function AdminLlmPage({ searchParams }: PageProps) {
	const params = await searchParams;
	const status = params.status || undefined;
	const page = Math.max(1, Number(params.page) || 1);

	const { requests, total } = await listLlmRequests({ status, page });

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-stone-50 sm:text-3xl">
					<Bot className="size-7 text-amber-400/90 sm:size-8" />
					Запросы к нейросети
				</h1>
				<div className="flex flex-wrap gap-1.5">
					{STATUS_FILTERS.map((f) => {
						const isActive = status === f.value || (!status && !f.value);
						const href = f.value
							? `/admin/llm?status=${f.value}`
							: "/admin/llm";
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

			<div className="overflow-x-auto rounded-2xl border border-stone-800/60 bg-stone-900/30">
				<table className="w-full min-w-[760px] text-left text-sm">
					<thead>
						<tr className="border-b border-stone-800/60 text-xs text-stone-500">
							<th className="px-4 py-3 font-medium">Пользователь</th>
							<th className="px-4 py-3 font-medium">Модель</th>
							<th className="px-4 py-3 font-medium">Статус</th>
							<th className="px-4 py-3 font-medium">Токены</th>
							<th className="px-4 py-3 font-medium">Стоимость</th>
							<th className="px-4 py-3 font-medium">Время</th>
							<th className="px-4 py-3 font-medium">Дата</th>
						</tr>
					</thead>
					<tbody>
						{requests.length === 0 ? (
							<tr>
								<td
									colSpan={7}
									className="px-4 py-10 text-center text-stone-500"
								>
									Запросов нет
								</td>
							</tr>
						) : (
							requests.map((r) => (
								<tr
									key={r.id}
									className="border-b border-stone-800/40 last:border-0 hover:bg-stone-800/30"
								>
									<td className="px-4 py-3">
										<Link
											href={`/admin/llm/${r.id}`}
											className="text-stone-200 hover:text-amber-300"
										>
											{r.userEmail ?? "—"}
										</Link>
									</td>
									<td className="px-4 py-3 text-stone-400">{r.model}</td>
									<td className="px-4 py-3">
										<LlmStatusBadge status={r.status} />
									</td>
									<td className="px-4 py-3 tabular-nums text-stone-400">
										{formatTokens(r.totalTokens)}
									</td>
									<td className="px-4 py-3 tabular-nums text-stone-200">
										{formatUsd(r.costMicroUsd)}
									</td>
									<td className="px-4 py-3 tabular-nums text-stone-500">
										{(r.latencyMs / 1000).toFixed(1)} с
									</td>
									<td className="px-4 py-3 text-xs text-stone-500">
										{formatDateTime(r.createdAt)}
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
				basePath="/admin/llm"
				searchParams={{ status }}
			/>
		</div>
	);
}
