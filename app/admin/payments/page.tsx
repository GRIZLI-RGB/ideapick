import { AdminPagination } from "@/components/admin/pagination";
import { PaymentStatusBadge } from "@/components/admin/payment-status-badge";
import { formatDateTime, formatRub } from "@/lib/admin/format";
import { ADMIN_PAGE_SIZE, listPayments } from "@/lib/admin/service";
import { Receipt } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_FILTERS = [
	{ value: undefined, label: "Все" },
	{ value: "succeeded", label: "Успешные" },
	{ value: "pending", label: "Ожидают" },
	{ value: "canceled", label: "Отменённые" },
] as const;

type PageProps = {
	searchParams: Promise<{ status?: string; page?: string }>;
};

export default async function AdminPaymentsPage({ searchParams }: PageProps) {
	const params = await searchParams;
	const status = params.status || undefined;
	const page = Math.max(1, Number(params.page) || 1);

	const { payments, total } = await listPayments({ status, page });

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-stone-50 sm:text-3xl">
					<Receipt className="size-7 text-amber-400/90 sm:size-8" />
					Платежи
				</h1>
				<div className="flex flex-wrap gap-1.5">
					{STATUS_FILTERS.map((f) => {
						const isActive = status === f.value || (!status && !f.value);
						const href = f.value
							? `/admin/payments?status=${f.value}`
							: "/admin/payments";
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
				<table className="w-full min-w-[720px] text-left text-sm">
					<thead>
						<tr className="border-b border-stone-800/60 text-xs text-stone-500">
							<th className="px-4 py-3 font-medium">Пользователь</th>
							<th className="px-4 py-3 font-medium">Сумма</th>
							<th className="px-4 py-3 font-medium">Зачислено</th>
							<th className="px-4 py-3 font-medium">Провайдер</th>
							<th className="px-4 py-3 font-medium">Статус</th>
							<th className="px-4 py-3 font-medium">Дата</th>
						</tr>
					</thead>
					<tbody>
						{payments.length === 0 ? (
							<tr>
								<td
									colSpan={6}
									className="px-4 py-10 text-center text-stone-500"
								>
									Платежей нет
								</td>
							</tr>
						) : (
							payments.map((p) => (
								<tr
									key={p.id}
									className="border-b border-stone-800/40 last:border-0 hover:bg-stone-800/30"
								>
									<td className="px-4 py-3">
										<Link
											href={`/admin/users/${p.userId}`}
											className="text-stone-200 hover:text-amber-300"
										>
											{p.userEmail}
										</Link>
									</td>
									<td className="px-4 py-3 tabular-nums text-stone-200">
										{formatRub(p.amount)}
									</td>
									<td className="px-4 py-3 tabular-nums text-stone-400">
										{formatRub(p.credited)}
										{p.bonus > 0 ? (
											<span className="text-xs text-emerald-400/80">
												{" "}
												(+{p.bonus} бонус)
											</span>
										) : null}
									</td>
									<td className="px-4 py-3 text-stone-400">{p.provider}</td>
									<td className="px-4 py-3">
										<PaymentStatusBadge status={p.status} />
									</td>
									<td className="px-4 py-3 text-xs text-stone-500">
										{formatDateTime(p.createdAt)}
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
				basePath="/admin/payments"
				searchParams={{ status }}
			/>
		</div>
	);
}
