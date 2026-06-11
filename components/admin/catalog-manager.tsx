"use client";

import { FileJson, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type CatalogItem = { title: string; description: string };

async function postItems(
	items: CatalogItem[],
): Promise<{ added: number; skipped: number }> {
	const res = await fetch("/api/admin/catalog", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ items }),
	});
	const data = await res.json().catch(() => null);
	if (!res.ok) {
		throw new Error(
			data && typeof data.error === "string"
				? data.error
				: "Что-то пошло не так",
		);
	}
	return data as { added: number; skipped: number };
}

/** Разбирает JSON-импорт: ожидается массив { title, description }. */
function parseImport(raw: string): CatalogItem[] {
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		throw new Error("Файл не является корректным JSON");
	}
	if (!Array.isArray(parsed)) {
		throw new Error("Ожидается JSON-массив объектов { title, description }");
	}
	return parsed.map((item, i) => {
		const obj = item as { title?: unknown; description?: unknown };
		if (
			typeof obj?.title !== "string" ||
			typeof obj?.description !== "string"
		) {
			throw new Error(
				`Элемент №${i + 1}: нужны строковые поля title и description`,
			);
		}
		return { title: obj.title, description: obj.description };
	});
}

const inputCls =
	"w-full rounded-xl border border-stone-700 bg-stone-950/60 px-3 py-2 text-sm text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20";

export function CatalogManager() {
	const router = useRouter();
	const fileRef = useRef<HTMLInputElement>(null);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [busy, setBusy] = useState<"add" | "import" | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	async function run(
		kind: "add" | "import",
		action: () => Promise<{ added: number; skipped: number }>,
	) {
		setBusy(kind);
		setError(null);
		setSuccess(null);
		try {
			const { added, skipped } = await action();
			setSuccess(
				skipped > 0
					? `Добавлено: ${added} · пропущено дублей: ${skipped}`
					: `Добавлено: ${added}`,
			);
			router.refresh();
			return true;
		} catch (err) {
			setError(err instanceof Error ? err.message : "Что-то пошло не так");
			return false;
		} finally {
			setBusy(null);
		}
	}

	async function handleAdd(e: React.FormEvent) {
		e.preventDefault();
		const ok = await run("add", () => postItems([{ title, description }]));
		if (ok) {
			setTitle("");
			setDescription("");
		}
	}

	async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file) return;
		let items: CatalogItem[];
		try {
			items = parseImport(await file.text());
		} catch (err) {
			setError(err instanceof Error ? err.message : "Не удалось прочитать файл");
			setSuccess(null);
			return;
		}
		await run("import", () => postItems(items));
	}

	return (
		<div className="space-y-4 rounded-2xl border border-stone-800/60 bg-stone-900/30 p-5">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h2 className="flex items-center gap-1.5 font-semibold text-stone-100">
					<Plus className="size-4 text-amber-400" />
					Пополнить пул
				</h2>
				<div>
					<input
						ref={fileRef}
						type="file"
						accept=".json,application/json"
						onChange={handleFile}
						className="hidden"
					/>
					<button
						type="button"
						disabled={busy !== null}
						onClick={() => fileRef.current?.click()}
						className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-stone-700 px-3.5 py-2 text-sm font-medium text-stone-200 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{busy === "import" ? (
							<Loader2 className="size-4 animate-spin" aria-hidden />
						) : (
							<Upload className="size-4" aria-hidden />
						)}
						Импорт JSON
					</button>
				</div>
			</div>

			<form onSubmit={handleAdd} className="space-y-2">
				<input
					type="text"
					required
					maxLength={80}
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Название идеи"
					className={inputCls}
				/>
				<div className="flex flex-wrap items-start gap-2">
					<textarea
						required
						rows={2}
						maxLength={1000}
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Описание: проблема, решение, монетизация, канал привлечения"
						className={`${inputCls} min-w-0 flex-1 resize-none`}
					/>
					<button
						type="submit"
						disabled={busy !== null || !title.trim() || !description.trim()}
						className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{busy === "add" ? (
							<Loader2 className="size-4 animate-spin" aria-hidden />
						) : null}
						Добавить
					</button>
				</div>
			</form>

			<p className="flex items-start gap-1.5 text-xs leading-relaxed text-stone-500">
				<FileJson className="mt-0.5 size-3.5 shrink-0" aria-hidden />
				Формат импорта: JSON-массив объектов{" "}
				<code className="rounded bg-stone-800 px-1 py-0.5 text-[11px] text-stone-300">
					{'[{ "title": "…", "description": "…" }]'}
				</code>
				— до 200 идей за раз, дубликаты по названию пропускаются.
			</p>

			{error ? (
				<p className="text-sm text-red-400" role="alert">
					{error}
				</p>
			) : null}
			{success ? <p className="text-sm text-emerald-400">{success}</p> : null}
		</div>
	);
}

/** Удаление свободной (невыданной) идеи из пула. */
export function CatalogDeleteButton({ id }: { id: string }) {
	const router = useRouter();
	const [busy, setBusy] = useState(false);

	async function handleDelete() {
		setBusy(true);
		try {
			const res = await fetch(`/api/admin/catalog/${id}`, {
				method: "DELETE",
			});
			if (res.ok) router.refresh();
		} finally {
			setBusy(false);
		}
	}

	return (
		<button
			type="button"
			disabled={busy}
			onClick={handleDelete}
			className="cursor-pointer rounded-lg p-1.5 text-stone-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
			aria-label="Удалить идею из пула"
			title="Удалить из пула"
		>
			{busy ? (
				<Loader2 className="size-4 animate-spin" />
			) : (
				<Trash2 className="size-4" />
			)}
		</button>
	);
}
