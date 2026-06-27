import type { BlogArticle, BlogListItem } from "@/lib/blog/types";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ideapick.ru";

/** Blog + BreadcrumbList для страницы ленты /blog. */
export function buildBlogListJsonLd(articles: BlogListItem[]) {
	const blogUrl = `${SITE_URL}/blog`;

	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "Blog",
				"@id": `${blogUrl}#blog`,
				url: blogUrl,
				name: "Блог Ideapick",
				description:
					"Гайды и разборы: как проверять, оценивать и запускать бизнес-идеи.",
				inLanguage: "ru-RU",
				publisher: {
					"@type": "Organization",
					name: "Ideapick",
					url: SITE_URL,
					logo: {
						"@type": "ImageObject",
						url: `${SITE_URL}/icons/icon-512x512.png`,
					},
				},
				blogPost: articles.map((a) => ({
					"@type": "BlogPosting",
					headline: a.title,
					description: a.excerpt,
					datePublished: a.publishedAt,
					url: `${blogUrl}/${a.slug}`,
				})),
			},
			{
				"@type": "BreadcrumbList",
				"@id": `${blogUrl}#breadcrumbs`,
				itemListElement: [
					{
						"@type": "ListItem",
						position: 1,
						name: "Главная",
						item: SITE_URL,
					},
					{
						"@type": "ListItem",
						position: 2,
						name: "Блог",
						item: blogUrl,
					},
				],
			},
		],
	};
}

/** BlogPosting + BreadcrumbList для страницы статьи. */
export function buildArticleJsonLd(article: BlogArticle) {
	const url = `${SITE_URL}/blog/${article.slug}`;
	const image = article.coverImage ?? `${url}/opengraph-image`;

	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "BlogPosting",
				"@id": `${url}#article`,
				headline: article.seoTitle ?? article.title,
				description: article.seoDescription ?? article.excerpt,
				image,
				inLanguage: "ru-RU",
				datePublished: article.publishedAt,
				dateModified: article.updatedAt,
				mainEntityOfPage: { "@type": "WebPage", "@id": url },
				author: {
					"@type": "Organization",
					name: "Ideapick",
					url: SITE_URL,
				},
				publisher: {
					"@type": "Organization",
					name: "Ideapick",
					url: SITE_URL,
					logo: {
						"@type": "ImageObject",
						url: `${SITE_URL}/icons/icon-512x512.png`,
					},
				},
			},
			{
				"@type": "BreadcrumbList",
				"@id": `${url}#breadcrumbs`,
				itemListElement: [
					{
						"@type": "ListItem",
						position: 1,
						name: "Главная",
						item: SITE_URL,
					},
					{
						"@type": "ListItem",
						position: 2,
						name: "Блог",
						item: `${SITE_URL}/blog`,
					},
					{
						"@type": "ListItem",
						position: 3,
						name: article.title,
						item: url,
					},
				],
			},
		],
	};
}
