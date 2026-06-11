import { getDashboardStats } from "@/lib/admin/service";
import { formatRub } from "@/lib/admin/format";
import {
	Headphones,
	LayoutDashboard,
	Lightbulb,
	TrendingUp,
	Users,
	Wallet,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function StatCard({
	label,
	value,
	hint,
	icon: Icon,
	href,
}: {
	label: string;
	value: string;
	hint?: string;
	icon: typeof Users;
	href?: string;
}) {
	const content = (
		<div className="flex h-full flex-col rounded-2xl border border-stone-800/60 bg-stone-900/30 p-5 transition-colors hover:border-stone-700/80 hover:bg-stone-800/30">
			<div className="flex items-center gap-2.5">
				<span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400/90">
					<Icon className="size-4" />
				</span>
				<span className="text-sm text-stone-400">{label}</span>
			</div>
			<p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-stone-50">
				{value}
			</p>
			{hint ? <p className="mt-1 text-xs text-stone-500">{hint}</p> : null}
		</div>
	);

	return href ? (
		<Link href={href} className="block h-full">
			{content}
		</Link>
	) : (
		content
	);
}

export default async function AdminDashboardPage() {
	const stats = await getDashboardStats();

	return (
		<div className="space-y-6">
			<h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-stone-50 sm:text-3xl">
				<LayoutDashboard className="size-7 text-amber-400/90 sm:size-8" />
				Дашборд
			</h1>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<StatCard
					label="Пользователи"
					value={String(stats.usersTotal)}
					hint={`+${stats.usersNew7d} за 7 дней`}
					icon={Users}
					href="/admin/users"
				/>
				<StatCard
					label="Выручка (всего)"
					value={formatRub(stats.revenueTotal)}
					hint="Успешные платежи, без бонусов"
					icon={Wallet}
					href="/admin/payments"
				/>
				<StatCard
					label="Выручка (30 дней)"
					value={formatRub(stats.revenue30d)}
					icon={TrendingUp}
					href="/admin/payments?status=succeeded"
				/>
				<StatCard
					label="Идеи"
					value={String(stats.ideasTotal)}
					icon={Lightbulb}
					href="/admin/ideas"
				/>
				<StatCard
					label="Открытые обращения"
					value={String(stats.openTickets)}
					hint="Статусы «открыт» и «в работе»"
					icon={Headphones}
					href="/admin/support"
				/>
			</div>
		</div>
	);
}
