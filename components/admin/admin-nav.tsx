"use client";

import {
	BookOpen,
	Bot,
	Headphones,
	LayoutDashboard,
	Lightbulb,
	Receipt,
	ScrollText,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
	{ href: "/admin", label: "Дашборд", Icon: LayoutDashboard, exact: true },
	{ href: "/admin/users", label: "Пользователи", Icon: Users, exact: false },
	{ href: "/admin/payments", label: "Платежи", Icon: Receipt, exact: false },
	{ href: "/admin/ideas", label: "Идеи", Icon: Lightbulb, exact: false },
	{ href: "/admin/catalog", label: "Каталог", Icon: BookOpen, exact: false },
	{ href: "/admin/llm", label: "Нейросеть", Icon: Bot, exact: false },
	{ href: "/admin/prompts", label: "Промпты", Icon: ScrollText, exact: false },
	{
		href: "/admin/support",
		label: "Поддержка",
		Icon: Headphones,
		exact: false,
	},
];

export function AdminNav() {
	const pathname = usePathname();

	return (
		<nav
			className="no-scrollbar flex items-center gap-1 overflow-x-auto"
			aria-label="Навигация админ-панели"
		>
			{ITEMS.map(({ href, label, Icon, exact }) => {
				const isActive = exact
					? pathname === href
					: pathname === href || pathname.startsWith(`${href}/`);

				return (
					<Link
						key={href}
						href={href}
						className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition ${
							isActive
								? "bg-stone-800/80 text-stone-100"
								: "text-stone-400 hover:bg-stone-800/50 hover:text-stone-200"
						}`}
					>
						<Icon className="size-4" />
						<span className="hidden sm:inline">{label}</span>
					</Link>
				);
			})}
		</nav>
	);
}
