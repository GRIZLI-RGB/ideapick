import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Сравнение — Ideapick",
};

export default function ComparePage() {
	return (
		<div className="mx-auto max-w-2xl">
			<h1 className="text-2xl font-bold tracking-tight text-stone-50 sm:text-3xl">
				Сравнение идей
			</h1>
			<p className="mt-2 text-sm leading-relaxed text-stone-500">
				Выберите 2–4 проанализированные идеи и сравните их в таблице — без
				нового вызова AI.
			</p>
			<p className="mt-6 rounded-2xl border border-dashed border-stone-700 bg-stone-900/30 px-5 py-4 text-sm text-stone-500">
				Заглушка — интерфейс сравнения будет на следующей итерации.
			</p>
		</div>
	);
}
