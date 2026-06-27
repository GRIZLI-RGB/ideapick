import { ArrowRight, Clock, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { BlogHeader } from "@/components/blog/blog-header";
import { LandingFooter } from "@/components/landing-v2/landing-footer";
import { SitePageBackdrop } from "@/components/site/site-page-backdrop";
import { formatArticleDate } from "@/lib/blog/format";
import { buildBlogListJsonLd } from "@/lib/blog/json-ld";
import { listPublishedArticles } from "@/lib/blog/service";

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

// Лента опубликованных статей; обновляется при публикации (revalidate).
export const revalidate = 300;

export default async function BlogIndexPage() {
	const articles = await listPublishedArticles();

	return (
		<SitePageBackdrop className="flex min-h-dvh flex-col">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(buildBlogListJsonLd(articles)),
				}}
			/>
			<BlogHeader />
			<main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-6 sm:py-14">
				<header className="max-w-2xl">
					<span className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/8 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-amber-300/85">
						Блог
					</span>
					<h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-stone-50 sm:text-4xl">
						Как проверять и запускать бизнес-идеи
					</h1>
					<p className="mt-3 text-pretty leading-relaxed text-stone-400">
						{BLOG_DESCRIPTION}
					</p>
				</header>

				<div className="mt-10 space-y-4">
					{articles.length === 0 ? (
						<div className="rounded-2xl border border-stone-800/60 bg-stone-900/30 px-5 py-14 text-center text-stone-500">
							Скоро здесь появятся статьи.
						</div>
					) : (
						articles.map((a) => (
							<Link
								key={a.slug}
								href={`/blog/${a.slug}`}
								className="group block rounded-2xl border border-stone-800/60 bg-stone-900/30 p-5 transition hover:border-amber-500/25 hover:bg-stone-900/55 sm:p-6"
							>
								<div className="flex items-center gap-2 text-xs text-stone-500">
									{a.category ? (
										<span className="rounded-full border border-stone-700/70 px-2 py-0.5 text-amber-300/80">
											{a.category}
										</span>
									) : null}
									<span>{formatArticleDate(a.publishedAt)}</span>
									<span className="inline-flex items-center gap-1">
										<Clock className="size-3.5" />
										{a.readingMinutes} мин
									</span>
								</div>
								<h2 className="mt-3 text-balance text-lg font-semibold text-stone-100 transition group-hover:text-amber-200 sm:text-xl">
									{a.title}
								</h2>
								<p className="mt-2 line-clamp-2 text-pretty text-sm leading-relaxed text-stone-400">
									{a.excerpt}
								</p>
								<span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-amber-400">
									Читать
									<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
								</span>
							</Link>
						))
					)}
				</div>

				<div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/[0.07] to-transparent px-6 py-8 text-center">
					<Sparkles className="size-6 text-amber-400" />
					<h2 className="text-balance text-lg font-semibold text-stone-100">
						Проверьте свою идею за пару минут
					</h2>
					<p className="max-w-md text-sm text-stone-400">
						Опишите идею — Ideapick оценит спрос, конкуренцию и монетизацию,
						выдаст вердикт 0–100 и план первых шагов. Первый анализ бесплатно.
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
