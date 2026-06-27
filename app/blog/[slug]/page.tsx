import { ArrowLeft, ArrowRight, Clock, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleMarkdown } from "@/components/blog/article-markdown";
import { BlogHeader } from "@/components/blog/blog-header";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { LandingFooter } from "@/components/landing-v2/landing-footer";
import { Reveal } from "@/components/landing-v2/reveal";
import { SitePageBackdrop } from "@/components/site/site-page-backdrop";
import { categoryStyle } from "@/lib/blog/category-style";
import { formatArticleDate } from "@/lib/blog/format";
import { buildArticleJsonLd } from "@/lib/blog/json-ld";
import { getPublishedArticle } from "@/lib/blog/service";

// Рендер на лету: контент и БД доступны в рантайме (на сборке БД нет).
// Для поисковиков это полноценный SSR — индексации не мешает.
export const dynamic = "force-dynamic";

type PageProps = {
	params: Promise<{ slug: string }>;
};

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const article = await getPublishedArticle(slug);
	if (!article) {
		return { title: "Статья не найдена", robots: { index: false } };
	}

	const title = article.seoTitle ?? article.title;
	const description = article.seoDescription ?? article.excerpt;
	const url = `/blog/${article.slug}`;

	return {
		title: { absolute: `${title} — Ideapick` },
		description,
		alternates: { canonical: url },
		openGraph: {
			title,
			description,
			url,
			type: "article",
			publishedTime: article.publishedAt,
			modifiedTime: article.updatedAt,
			...(article.coverImage ? { images: [{ url: article.coverImage }] } : {}),
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
		},
	};
}

export default async function ArticlePage({ params }: PageProps) {
	const { slug } = await params;
	const article = await getPublishedArticle(slug);
	if (!article) notFound();

	const style = categoryStyle(article.category);

	return (
		<SitePageBackdrop className="flex min-h-dvh flex-col">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(buildArticleJsonLd(article)),
				}}
			/>
			<ReadingProgress />
			<BlogHeader />
			<main className="relative mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-6 sm:py-14">
				<div
					className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-64 opacity-80"
					style={{
						background: `radial-gradient(ellipse at 50% 0%, ${style.glow}, transparent 60%)`,
					}}
					aria-hidden
				/>
				<Link
					href="/blog"
					className="inline-flex items-center gap-1.5 text-sm text-stone-400 transition hover:text-stone-200"
				>
					<ArrowLeft className="size-4" />
					Все статьи
				</Link>

				<article className="mt-6">
					<Reveal>
						<header className="border-b border-stone-800/60 pb-6">
							<div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-stone-500">
								{article.category ? (
									<span
										className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${style.badge}`}
									>
										<span className={`size-1.5 rounded-full ${style.dot}`} />
										{article.category}
									</span>
								) : null}
								<time dateTime={article.publishedAt}>
									{formatArticleDate(article.publishedAt)}
								</time>
								<span className="inline-flex items-center gap-1">
									<Clock className="size-3.5" />
									{article.readingMinutes} мин чтения
								</span>
							</div>
							<h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-stone-50 sm:text-4xl sm:leading-tight">
								{article.title}
							</h1>
							<p className="mt-3 text-pretty text-lg leading-relaxed text-stone-400">
								{article.excerpt}
							</p>
						</header>
					</Reveal>

					<ArticleMarkdown content={article.content} />
				</article>

				<Reveal>
					<div className="relative mt-14 overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.10] via-stone-900/40 to-transparent px-6 py-10 text-center">
						<div
							className="pointer-events-none absolute inset-0 -z-10 opacity-60 [background:radial-gradient(circle_at_50%_0%,rgb(245_158_11/0.12),transparent_55%)]"
							aria-hidden
						/>
						<Sparkles className="mx-auto size-7 text-amber-400" />
						<h2 className="mt-3 text-balance text-xl font-bold text-stone-50">
							Проверьте свою идею с Ideapick
						</h2>
						<p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-400">
							AI оценит спрос, конкуренцию и монетизацию, выдаст вердикт 0–100 и
							план первых шагов. Первый анализ бесплатно.
						</p>
						<Link
							href="/login"
							className="group mt-5 inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-stone-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400"
						>
							Проверить идею бесплатно
							<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
						</Link>
					</div>
				</Reveal>
			</main>
			<LandingFooter />
		</SitePageBackdrop>
	);
}
