import { ArrowLeft, ArrowRight, Clock, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleMarkdown } from "@/components/blog/article-markdown";
import { BlogHeader } from "@/components/blog/blog-header";
import { LandingFooter } from "@/components/landing-v2/landing-footer";
import { SitePageBackdrop } from "@/components/site/site-page-backdrop";
import { formatArticleDate } from "@/lib/blog/format";
import { buildArticleJsonLd } from "@/lib/blog/json-ld";
import {
	getPublishedArticle,
	listPublishedSlugs,
} from "@/lib/blog/service";

export const revalidate = 300;

export async function generateStaticParams() {
	const slugs = await listPublishedSlugs();
	return slugs.map(({ slug }) => ({ slug }));
}

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

	return (
		<SitePageBackdrop className="flex min-h-dvh flex-col">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(buildArticleJsonLd(article)),
				}}
			/>
			<BlogHeader />
			<main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-6 sm:py-14">
				<Link
					href="/blog"
					className="inline-flex items-center gap-1.5 text-sm text-stone-400 transition hover:text-stone-200"
				>
					<ArrowLeft className="size-4" />
					Все статьи
				</Link>

				<article className="mt-6">
					<header className="border-b border-stone-800/60 pb-6">
						<div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
							{article.category ? (
								<span className="rounded-full border border-stone-700/70 px-2 py-0.5 text-amber-300/80">
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

					<ArticleMarkdown content={article.content} />
				</article>

				<div className="mt-14 flex flex-col items-center gap-4 rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/[0.07] to-transparent px-6 py-8 text-center">
					<Sparkles className="size-6 text-amber-400" />
					<h2 className="text-balance text-lg font-semibold text-stone-100">
						Проверьте свою идею с Ideapick
					</h2>
					<p className="max-w-md text-sm text-stone-400">
						AI оценит спрос, конкуренцию и монетизацию, выдаст вердикт 0–100 и
						план первых шагов. Первый анализ бесплатно.
					</p>
					<Link
						href="/login"
						className="group inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-400"
					>
						Проверить идею бесплатно
						<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
					</Link>
				</div>
			</main>
			<LandingFooter />
		</SitePageBackdrop>
	);
}
