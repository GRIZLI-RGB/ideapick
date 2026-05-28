import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Настройки — Ideapick",
};

export default function SettingsPage() {
	return (
		<div className="mx-auto max-w-lg">
			<h1 className="text-2xl font-bold tracking-tight text-stone-50 sm:text-3xl">
				Настройки
			</h1>
			<p className="mt-2 text-sm text-stone-500">
				Аккаунт, баланс, пополнение и история операций.
			</p>
			<p className="mt-6 rounded-2xl border border-dashed border-stone-700 bg-stone-900/30 px-5 py-4 text-sm text-stone-500">
				Заглушка — полный функционал настроек будет позже.
			</p>
		</div>
	);
}
