import type { Metadata } from "next";
import { ArrowLeft, Settings } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Настройки — Ideapick",
	description: "Настройки аккаунта Ideapick.",
};

export default function SettingsPage() {
	return (
		<div className="w-full space-y-6 pb-8">
			<div className="flex items-center gap-3">
				<Link
					href="/app/ideas"
					className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-stone-700/80 text-stone-400 transition hover:border-stone-600 hover:bg-stone-800 hover:text-stone-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
					aria-label="Назад"
				>
					<ArrowLeft className="size-4" />
				</Link>
				<h1 className="text-2xl font-bold tracking-tight text-stone-50 sm:text-3xl">
					Настройки
				</h1>
			</div>

			<div className="rounded-3xl border border-dashed border-stone-700 bg-stone-900/20 px-6 py-12 text-center">
				<div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-stone-800/80 text-amber-400">
					<Settings className="size-7" />
				</div>
				<h2 className="text-lg font-semibold text-stone-100">Скоро появятся</h2>
				<p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-stone-500">
					Здесь будут настройки аккаунта, управление балансом и история
					операций.
				</p>
			</div>
		</div>
	);
}
