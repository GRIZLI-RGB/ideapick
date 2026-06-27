import { ArrowRight, Clock, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { BlogHeader } from "@/components/blog/blog-header";
import { LandingFooter } from "@/components/landing-v2/landing-footer";
import { Reveal } from "@/components/landing-v2/reveal";
import { SitePageBackdrop } from "@/components/site/site-page-backdrop";
import { categoryStyle } from "@/lib/blog/category-style";
import { formatArticleDate } from "@/lib/blog/format";
import { buildBlogListJsonLd } from "@/lib/blog/json-ld";
import { listPublishedArticles } from "@/lib/blog/service";
import type { BlogListItem } from "@/lib/blog/types";

const BLOG_TITLE = "Блог Ideapick — как проверять и запускать бизнес-идеи";
const BLOG_DESCRIPTION =
	"Гайды, чек-листы и разборы: как оценить спрос, посчитать юнит-экономику и проверить бизнес-идею до запуска. Практика без воды.";

export const metadata: Metadata = {
	title: { absolute: BLOG_TITLE },
	description: BLOG_DESCRIPTION,
	alternates: { canonical: "/blog" },
	openGraph: {
		title: BLOG_TITLE,
		description: BLOG_DESCRIPTION,
		url: "/blog",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: BLOG_TITLE,
		description: BLOG_DESCRIPTION,
	},
};

// Рендер на лету: на этапе сборки БД недоступна, данные читаются в рантайме.
export const dynamic = "force-dynamic";

function CategoryBadge({ category }: { category: string | null }) {
	if (!category) return null;
	const style = categoryStyle(category);
	return (
		<span
			className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${style.badge}`}
		>
			<span className={`size-1.5 rounded-full ${style.dot}`} />
			{category}
		</span>
	);
}

function MetaRow({ article }: { article: BlogListItem }) {
	return (
		<div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-stone-500">
			<CategoryBadge category={article.category} />
			<span>{formatArticleDate(article.publishedAt)}</span>
			<span className="inline-flex items-center gap-1">
				<Clock className="size-3.5" />
				{article.readingMinutes} мин
			</span>
		</div>
	);
}

function FeaturedCard({ article }: { article: BlogListItem }) {
	const style = categoryStyle(article.category);
	return (
		<Reveal>
			<Link
				href={`/blog/${article.slug}`}
				className="group relative block overflow-hidden rounded-3xl border border-stone-800/60 bg-stone-900/40 p-6 transition duration-300 hover:border-amber-500/30 sm:p-8"
			>
				<div
					className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full opacity-70 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
					style={{
						background: `radial-gradient(circle, ${style.glow} 0%, transparent 70%)`,
					}}
					aria-hidden
				/>
				<div className="relative">
					<div className="flex items-center gap-2">
						<CategoryBadge category={article.category} />
						<span className="rounded-full border border-stone-700/70 px-2 py-0.5 text-[11px] font-medium text-stone-400">
							Свежее
						</span>
					</div>
					<h2 className="mt-4 text-balance text-2xl font-bold tracking-tight text-stone-50 transition group-hover:text-amber-100 sm:text-3xl sm:leading-tight">
						{article.title}
					</h2>
					<p className="mt-3 max-w-2xl text-pretty leading-relaxed text-stone-400">
						{article.excerpt}
					</p>
					<div className="mt-5 flex items-center justify-between">
						<span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400">
							Читать статью
							<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
						</span>
						<span className="inline-flex items-center gap-1 text-xs text-stone-500">
							<Clock className="size-3.5" />
							{article.readingMinutes} мин · {formatArticleDate(article.publishedAt)}
						</span>
					</div>
				</div>
			</Link>
		</Reveal>
	);
}

function ArticleCard({
	article,
	index,
}: {
	article: BlogListItem;
	index: number;
}) {
	const style = categoryStyle(article.category);
	return (
		<Reveal delay={index * 0.05}>
			<Link
				href={`/blog/${article.slug}`}
				className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-stone-800/60 bg-stone-900/30 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-amber-500/25 hover:bg-stone-900/55 sm:p-6"
			>
				<div
					className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
					style={{
						background: `radial-gradient(circle, ${style.glow} 0%, transparent 70%)`,
					}}
					aria-hidden
				/>
				<div className="relative flex h-full flex-col">
					<MetaRow article={article} />
					<h2 className="mt-3 text-balance text-lg font-semibold text-stone-100 transition group-hover:text-amber-200">
						{article.title}
					</h2>
					<p className="mt-2 line-clamp-3 flex-1 text-pretty text-sm leading-relaxed text-stone-400">
						{article.excerpt}
					</p>
					<span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-amber-400">
						Читать
						<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
					</span>
				</div>
			</Link>
		</Reveal>
	);
}

export default async function BlogIndexPage() {
	const articles = await listPublishedArticles();
	const [featured, ...rest] = articles;

	return (
		<SitePageBackdrop className="flex min-h-dvh flex-col">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(buildBlogListJsonLd(articles)),
				}}
			/>
			<BlogHeader />
			<main className="relative mx-auto w-full max-w-4xl flex-1 px-5 py-10 sm:px-6 sm:py-14">
				<div
					className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-72 bg-[radial-gradient(ellipse_at_50%_0%,rgb(245_158_11/0.10),transparent_60%)]"
					aria-hidden
				/>
				<Reveal>
					<header className="max-w-2xl">
						<span className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/8 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-amber-300/85">
							Блог Ideapick
						</span>
						<h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-stone-50 sm:text-4xl sm:leading-tight">
							Как проверять и запускать бизнес-идеи
						</h1>
						<p className="mt-3 text-pretty leading-relaxed text-stone-400">
							{BLOG_DESCRIPTION}
						</p>
					</header>
				</Reveal>

				{articles.length === 0 ? (
					<div className="mt-10 rounded-2xl border border-stone-800/60 bg-stone-900/30 px-5 py-14 text-center text-stone-500">
						Скоро здесь появятся статьи.
					</div>
				) : (
					<div className="mt-10 space-y-5">
						{featured ? <FeaturedCard article={featured} /> : null}
						{rest.length > 0 ? (
							<div className="grid gap-5 sm:grid-cols-2">
								{rest.map((a, i) => (
									<ArticleCard key={a.slug} article={a} index={i} />
								))}
							</div>
						) : null}
					</div>
				)}

				<Reveal>
					<div className="group relative mt-14 overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.10] via-stone-900/40 to-transparent px-6 py-10 text-center">
						<div
							className="pointer-events-none absolute inset-0 -z-10 opacity-60 [background:radial-gradient(circle_at_50%_0%,rgb(245_158_11/0.12),transparent_55%)]"
							aria-hidden
						/>
						<Sparkles className="mx-auto size-7 text-amber-400" />
						<h2 className="mt-3 text-balance text-xl font-bold text-stone-50">
							Проверьте свою идею за пару минут
						</h2>
						<p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-400">
							Опишите идею — Ideapick оценит спрос, конкуренцию и монетизацию,
							выдаст вердикт 0–100 и план первых шагов. Первый анализ бесплатно.
						</p>
						<Link
							href="/login"
							className="group/btn mt-5 inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-stone-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400"
						>
							Проверить идею бесплатно
							<ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
						</Link>
					</div>
				</Reveal>
			</main>
			<LandingFooter />
		</SitePageBackdrop>
	);
}
