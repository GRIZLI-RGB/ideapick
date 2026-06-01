"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HEADER_SCALE, resolveAppNavId } from "@/lib/app/header-scale";
import { useSupportDemo } from "@/components/support/support-demo-provider";
import { GitCompare, Headphones, Lightbulb } from "lucide-react";

export function AppNav() {
	const pathname = usePathname();
	const active = resolveAppNavId(pathname);
	const { hasAttention } = useSupportDemo();
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
			id: "support" as const,
			href: "/app/support",
			label: "Поддержка",
			Icon: Headphones,
		},
	];

	return (
		<nav className="flex items-center gap-1 sm:gap-2" aria-label="Основная навигация">
			{items.map(({ id, href, label, Icon }) => {
				const isActive = active === id;
				const showDot = id === "support" && hasAttention && !isActive;

				return (
					<Link
						key={id}
						href={href}
						className={`${linkBase} relative ${
							isActive
								? "bg-stone-800/80 text-stone-100"
								: "text-stone-400 hover:bg-stone-800/50 hover:text-stone-200"
						}`}
					>
						<span className="relative">
							<Icon className={iconCls} />
							{showDot ? (
								<span
									className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-amber-400 ring-2 ring-stone-950"
									aria-hidden
								/>
							) : null}
						</span>
						<span className="hidden sm:inline">{label}</span>
					</Link>
				);
			})}
		</nav>
	);
}
