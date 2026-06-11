import { AdminNav } from "@/components/admin/admin-nav";
import { SitePageBackdrop } from "@/components/site/site-page-backdrop";
import { requireAdmin } from "@/lib/auth/admin";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Админ-панель — Ideapick",
	robots: { index: false, follow: false },
};

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const admin = await requireAdmin();

	return (
		<SitePageBackdrop className="flex min-h-dvh flex-col">
			<header className="sticky top-0 z-20 border-b border-stone-800/60 bg-stone-950/80 backdrop-blur">
				<div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
					<div className="flex min-w-0 items-center gap-4">
						<Link
							href="/admin"
							className="flex shrink-0 items-center gap-2 font-semibold text-stone-100"
						>
							<ShieldCheck className="size-5 text-amber-400" />
							<span className="hidden md:inline">Админ-панель</span>
						</Link>
						<AdminNav />
					</div>
					<div className="flex shrink-0 items-center gap-3">
						<span className="hidden truncate text-xs text-stone-500 lg:inline">
							{admin.email}
						</span>
						<Link
							href="/app/ideas"
							className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-stone-400 transition hover:bg-stone-800/50 hover:text-stone-200"
						>
							<ArrowLeft className="size-4" />
							<span className="hidden sm:inline">В приложение</span>
						</Link>
					</div>
				</div>
			</header>
			<main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
				{children}
			</main>
		</SitePageBackdrop>
	);
}
