"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HEADER_SCALE, resolveAppNavId } from "@/lib/app/header-scale";
import { GitCompare, Lightbulb, Settings } from "lucide-react";

export function AppNav() {
	const pathname = usePathname();
	const active = resolveAppNavId(pathname);
	const linkBase = `${HEADER_SCALE.nav} flex items-center gap-1.5 rounded-lg transition`;
	const iconCls = HEADER_SCALE.icon;

	const items = [
		{
			id: "ideas" as const,
			href: "/app/ideas",
			label: "Идеи",
			Icon: Lightbulb,
		},
		{
			id: "compare" as const,
			href: "/app/compare",
			label: "Сравнение",
			Icon: GitCompare,
		},
		{
			id: "settings" as const,
			href: "/app/settings",
			label: "Настройки",
			Icon: Settings,
		},
	];

	return (
		<nav className="flex items-center gap-1 sm:gap-2" aria-label="Основная навигация">
			{items.map(({ id, href, label, Icon }) => {
				const isActive = active === id;
				return (
					<Link
						key={id}
						href={href}
						className={`${linkBase} ${
							isActive
								? "bg-stone-800/80 text-stone-100"
								: "text-stone-400 hover:bg-stone-800/50 hover:text-stone-200"
						}`}
					>
						<Icon className={iconCls} />
						<span className="hidden sm:inline">{label}</span>
					</Link>
				);
			})}
		</nav>
	);
}
