import { RotateCcw, TriangleAlert } from "lucide-react";

type ErrorPageProps = {
	onReset: () => void;
};

export function ErrorPage({ onReset }: ErrorPageProps) {
	return (
		<main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
			<p
				className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-[clamp(11rem,34vw,19rem)] font-bold leading-none tracking-tighter text-stone-900/90"
				aria-hidden
			>
				500
			</p>
			<div
				className="pointer-events-none absolute top-1/2 left-1/2 size-[min(72vw,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/5 blur-3xl"
				aria-hidden
			/>

			<div className="relative z-10 flex flex-col items-center">
				<div className="flex size-16 items-center justify-center rounded-2xl bg-stone-800/60 text-amber-400">
					<TriangleAlert className="size-8" />
				</div>
				<h1 className="mt-8 text-2xl font-bold tracking-tight text-stone-50">
					Что-то пошло не так
				</h1>
				<p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-stone-500">
					Произошла непредвиденная ошибка. Попробуйте обновить страницу — обычно
					это помогает.
				</p>
				<button
					type="button"
					onClick={onReset}
					className="mt-8 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-400"
				>
					<RotateCcw className="size-4" />
					Попробовать снова
				</button>
			</div>
		</main>
	);
}
