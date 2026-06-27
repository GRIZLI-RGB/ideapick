"use client";

import { ExternalLink, Eye, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { slugify } from "@/lib/blog/slug";
import type { AdminArticle, ArticleStatus } from "@/lib/blog/types";

const inputCls =
	"w-full rounded-xl border border-stone-700 bg-stone-950/60 px-3 py-2 text-sm text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20";
const labelCls = "block text-xs font-medium text-stone-400";

type ArticleEditorProps = {
	/** Существующая статья — режим редактирования; undefined — создание. */
	article?: AdminArticle;
};

export function ArticleEditor({ article }: ArticleEditorProps) {
	const router = useRouter();
	const isEdit = Boolean(article);

	const [title, setTitle] = useState(article?.title ?? "");
	const [slug, setSlug] = useState(article?.slug ?? "");
	const [category, setCategory] = useState(article?.category ?? "");
	const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
	const [content, setContent] = useState(article?.content ?? "");
	const [coverImage, setCoverImage] = useState(article?.coverImage ?? "");
	const [seoTitle, setSeoTitle] = useState(article?.seoTitle ?? "");
	const [seoDescription, setSeoDescription] = useState(
		article?.seoDescription ?? "",
	);
	const [status, setStatus] = useState<ArticleStatus>(
		article?.status ?? "draft",
	);

	// Слаг авто-следует за заголовком, пока пользователь не правил его вручную.
	const slugEdited = useRef(isEdit);
	useEffect(() => {
		if (!slugEdited.current) setSlug(slugify(title));
	}, [title]);

	const [busy, setBusy] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setBusy(true);
		setError(null);
		setSuccess(null);
		const payload = {
			title,
			slug,
			category,
			excerpt,
			content,
			coverImage,
			seoTitle,
			seoDescription,
			status,
		};
		try {
			const res = await fetch(
				isEdit ? `/api/admin/articles/${article!.id}` : "/api/admin/articles",
				{
					method: isEdit ? "PATCH" : "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				},
			);
			const data = await res.json().catch(() => null);
			if (!res.ok) {
				throw new Error(
					data && typeof data.error === "string"
						? data.error
						: "Не удалось сохранить",
				);
			}
			if (!isEdit && data?.id) {
				router.push(`/admin/articles/${data.id}`);
				router.refresh();
				return;
			}
			setSuccess("Сохранено");
			router.refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Что-то пошло не так");
		} finally {
			setBusy(false);
		}
	}

	async function handleDelete() {
		if (!article) return;
		if (!confirm("Удалить статью безвозвратно?")) return;
		setDeleting(true);
		try {
			const res = await fetch(`/api/admin/articles/${article.id}`, {
				method: "DELETE",
			});
			if (res.ok) {
				router.push("/admin/articles");
				router.refresh();
			}
		} finally {
			setDeleting(false);
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-5 rounded-2xl border border-stone-800/60 bg-stone-900/30 p-5"
		>
			<div className="space-y-1">
				<label className={labelCls} htmlFor="art-title">
					Заголовок
				</label>
				<input
					id="art-title"
					type="text"
					required
					maxLength={140}
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Как проверить бизнес-идею перед запуском"
					className={inputCls}
				/>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-1">
					<label className={labelCls} htmlFor="art-slug">
						Слаг (URL)
					</label>
					<input
						id="art-slug"
						type="text"
						required
						value={slug}
						onChange={(e) => {
							slugEdited.current = true;
							setSlug(e.target.value);
						}}
						placeholder="kak-proverit-biznes-ideyu"
						className={`${inputCls} font-mono text-xs`}
					/>
					<p className="text-[11px] text-stone-600">/blog/{slug || "…"}</p>
				</div>
				<div className="space-y-1">
					<label className={labelCls} htmlFor="art-category">
						Рубрика (необязательно)
					</label>
					<input
						id="art-category"
						type="text"
						maxLength={60}
						value={category}
						onChange={(e) => setCategory(e.target.value)}
						placeholder="Гайды"
						className={inputCls}
					/>
				</div>
			</div>

			<div className="space-y-1">
				<label className={labelCls} htmlFor="art-excerpt">
					Анонс (для карточки и соцсетей)
				</label>
				<textarea
					id="art-excerpt"
					required
					rows={2}
					maxLength={320}
					value={excerpt}
					onChange={(e) => setExcerpt(e.target.value)}
					placeholder="Короткое описание статьи в 1–2 предложения."
					className={`${inputCls} resize-none`}
				/>
			</div>

			<div className="space-y-1">
				<label className={labelCls} htmlFor="art-content">
					Текст статьи (Markdown)
				</label>
				<textarea
					id="art-content"
					required
					rows={22}
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder={"## Заголовок раздела\n\nАбзац текста. **Жирный**, *курсив*, [ссылка](https://...).\n\n- пункт списка\n- ещё пункт"}
					className={`${inputCls} resize-y font-mono text-xs leading-relaxed`}
				/>
				<p className="text-[11px] text-stone-600">
					Поддерживается Markdown: ## заголовки, **жирный**, списки, ссылки,
					цитаты, таблицы.
				</p>
			</div>

			<details className="rounded-xl border border-stone-800/60 bg-stone-950/30 p-4">
				<summary className="cursor-pointer text-sm font-medium text-stone-300">
					SEO и обложка (необязательно)
				</summary>
				<div className="mt-4 space-y-4">
					<div className="space-y-1">
						<label className={labelCls} htmlFor="art-seo-title">
							SEO-заголовок (по умолчанию — заголовок статьи)
						</label>
						<input
							id="art-seo-title"
							type="text"
							maxLength={70}
							value={seoTitle}
							onChange={(e) => setSeoTitle(e.target.value)}
							className={inputCls}
						/>
					</div>
					<div className="space-y-1">
						<label className={labelCls} htmlFor="art-seo-desc">
							SEO-описание (по умолчанию — анонс)
						</label>
						<textarea
							id="art-seo-desc"
							rows={2}
							maxLength={200}
							value={seoDescription}
							onChange={(e) => setSeoDescription(e.target.value)}
							className={`${inputCls} resize-none`}
						/>
					</div>
					<div className="space-y-1">
						<label className={labelCls} htmlFor="art-cover">
							URL обложки (если пусто — картинка для соцсетей сгенерируется
							автоматически)
						</label>
						<input
							id="art-cover"
							type="url"
							value={coverImage}
							onChange={(e) => setCoverImage(e.target.value)}
							placeholder="https://…"
							className={inputCls}
						/>
					</div>
				</div>
			</details>

			<div className="flex flex-wrap items-center gap-4 border-t border-stone-800/60 pt-4">
				<label className="flex cursor-pointer items-center gap-2 text-sm text-stone-300">
					<input
						type="checkbox"
						checked={status === "published"}
						onChange={(e) =>
							setStatus(e.target.checked ? "published" : "draft")
						}
						className="size-4 accent-amber-500"
					/>
					Опубликовать (видна на сайте и в поиске)
				</label>
				{isEdit && status === "published" ? (
					<Link
						href={`/blog/${slug}`}
						target="_blank"
						className="inline-flex items-center gap-1.5 text-sm text-stone-400 transition hover:text-stone-200"
					>
						<ExternalLink className="size-3.5" />
						Открыть на сайте
					</Link>
				) : null}
			</div>

			<div className="flex flex-wrap items-center gap-3">
				<button
					type="submit"
					disabled={busy}
					className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
					{isEdit ? "Сохранить" : "Создать"}
				</button>
				{isEdit ? (
					<button
						type="button"
						onClick={handleDelete}
						disabled={deleting}
						className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-stone-700 px-3.5 py-2 text-sm font-medium text-stone-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{deleting ? (
							<Loader2 className="size-4 animate-spin" aria-hidden />
						) : (
							<Trash2 className="size-4" aria-hidden />
						)}
						Удалить
					</button>
				) : null}
				{error ? (
					<span className="text-sm text-red-400" role="alert">
						{error}
					</span>
				) : null}
				{success ? (
					<span className="inline-flex items-center gap-1.5 text-sm text-emerald-400">
						<Eye className="size-4" />
						{success}
					</span>
				) : null}
			</div>
		</form>
	);
}
