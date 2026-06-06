import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ideapick.ru";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: ["/app", "/login", "/api"],
		},
		sitemap: `${BASE_URL}/sitemap.xml`,
	};
}
