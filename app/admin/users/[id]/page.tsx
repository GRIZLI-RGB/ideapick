import { PaymentStatusBadge } from "@/components/admin/payment-status-badge";
import { UserActions } from "@/components/admin/user-actions";
import { formatDateTime, formatRub } from "@/lib/admin/format";
import { getUserDetail } from "@/lib/admin/service";
import { requireAdmin } from "@/lib/auth/admin";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
	params: Promise<{ id: string }>;
};

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section className="rounded-2xl border border-stone-800/60 bg-stone-900/30 p-5">
			<h2 className="mb-3 font-semibold text-stone-100">{title}</h2>
			{children}
		</section>
	);
}

export default async function AdminUserPage({ params }: PageProps) {
	const admin = await requireAdmin();
	const { id } = await params;
	const detail = await getUserDetail(id);
	if (!detail) notFound();

	return (
		<div className="space-y-6">
			<Link
				href="/admin/users"
				className="inline-flex w-fit items-center gap-1.5 rounded-lg px-1 py-1 text-sm text-stone-500 transition hover:text-stone-300"
			>
				<ArrowLeft className="size-4" />К списку
			</Link>

			<div className="flex flex-col gap-4 lg:flex-row lg:items-start">
				<div className="flex-1 space-y-1 rounded-2xl border border-stone-800/60 bg-stone-900/30 p-5">
					<div className="flex flex-wrap items-center gap-2">
						<h1 className="text-xl font-bold tracking-tight text-stone-50">
							{detail.email}
						</h1>
						{detail.role === "admin" ? (
							<span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-200">
								Админ
							</span>
						) : null}
						{detail.banned ? (
							<span className="rounded-full border border-red-500/35 bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-300">
								Забанен
							</span>
						) : null}
					</div>
					<p className="text-sm text-stone-400">{detail.name}</p>
					{detail.banned && detail.banReason ? (
						<p className="text-sm text-red-400/80">
							Причина бана: {detail.banReason}
						</p>
					) : null}
					<p className="text-xs text-stone-500">
						Регистрация: {formatDateTime(detail.createdAt)}
					</p>
					<p className="pt-2 text-2xl font-bold tabular-nums text-stone-50">
						{formatRub(detail.balance)}
					</p>
				</div>

				<div className="flex-1">
					<UserActions
						userId={detail.id}
						banned={detail.banned}
						isSelf={detail.id === admin.id}
					/>
				</div>
			</div>

			<Section title={`Операции кошелька (${detail.transactions.length})`}>
				{detail.transactions.length === 0 ? (
					<p className="text-sm text-stone-500">Операций нет</p>
				) : (
					<ul className="divide-y divide-stone-800/40">
						{detail.transactions.map((t) => (
							<li
								key={t.id}
								className="flex items-center justify-between gap-3 py-2"
							>
								<div className="min-w-0">
									<p className="truncate text-sm text-stone-200">{t.label}</p>
									<p className="text-xs text-stone-500">
										{t.kind} · {formatDateTime(t.createdAt)}
									</p>
								</div>
								<span
									className={`shrink-0 text-sm font-semibold tabular-nums ${
										t.amount > 0 ? "text-emerald-400" : "text-stone-400"
									}`}
								>
									{t.amount > 0 ? "+" : ""}
									{t.amount} ₽
								</span>
							</li>
						))}
					</ul>
				)}
			</Section>

			<Section title={`Платежи (${detail.payments.length})`}>
				{detail.payments.length === 0 ? (
					<p className="text-sm text-stone-500">Платежей нет</p>
				) : (
					<ul className="divide-y divide-stone-800/40">
						{detail.payments.map((p) => (
							<li
								key={p.id}
								className="flex items-center justify-between gap-3 py-2"
							>
								<div className="min-w-0">
									<p className="text-sm text-stone-200">
										{formatRub(p.amount)}
										{p.credited !== p.amount
											? ` (зачислено ${formatRub(p.credited)})`
											: ""}
									</p>
									<p className="text-xs text-stone-500">
										{p.provider} · {formatDateTime(p.createdAt)}
									</p>
								</div>
								<PaymentStatusBadge status={p.status} />
							</li>
						))}
					</ul>
				)}
			</Section>

			<Section title={`Идеи (${detail.ideas.length})`}>
				{detail.ideas.length === 0 ? (
					<p className="text-sm text-stone-500">Идей нет</p>
				) : (
					<ul className="divide-y divide-stone-800/40">
						{detail.ideas.map((i) => (
							<li key={i.id} className="py-2">
								<p className="text-sm text-stone-200">{i.title}</p>
								<p className="text-xs text-stone-500">
									{i.source} · {formatDateTime(i.createdAt)}
								</p>
							</li>
						))}
					</ul>
				)}
			</Section>
		</div>
	);
}