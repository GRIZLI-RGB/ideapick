import type { MetadataRoute } from "next";
import { listPublishedSlugs } from "@/lib/blog/service";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ideapick.ru";

// Карта сайта читает статьи из БД, которой нет на этапе сборки — генерируем
// её в рантайме.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const lastModified = new Date();

	const articles = await listPublishedSlugs();
	const articleEntries: MetadataRoute.Sitemap = articles.map(
		({ slug, updatedAt }) => ({
			url: `${BASE_URL}/blog/${slug}`,
			lastModified: updatedAt,
			changeFrequency: "monthly",
			priority: 0.7,
		}),
	);

	return [
		{
			url: `${BASE_URL}/`,
			lastModified,
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: `${BASE_URL}/blog`,
			lastModified,
			changeFrequency: "daily",
			priority: 0.8,
		},
		...articleEntries,
		{
			url: `${BASE_URL}/terms`,
			lastModified,
			changeFrequency: "yearly",
			priority: 0.5,
		},
		{
			url: `${BASE_URL}/privacy`,
			lastModified,
			changeFrequency: "yearly",
			priority: 0.5,
		},
	];
}
