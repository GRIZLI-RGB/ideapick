import { LANDING_FAQ_ITEMS } from "@/lib/landing/faq-items";
import { PRICES } from "@/lib/ideas/constants";

const SITE_URL =
	process.env.NEXT_PUBLIC_APP_URL ?? "https://ideapick.ru";

const LANDING_DESCRIPTION =
	"Опишите идею в двух предложениях — Ideapick оценит спрос, конкуренцию, монетизацию и риски, выдаст вердикт 0–100 и план первых шагов. Первый анализ — бесплатно.";

/** Structured data для главной страницы (Organization, WebSite, SoftwareApplication, FAQPage). */
export function buildLandingJsonLd() {
	const orgId = `${SITE_URL}/#organization`;
	const websiteId = `${SITE_URL}/#website`;
	const appId = `${SITE_URL}/#software`;

	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "Organization",
				"@id": orgId,
				name: "Ideapick",
				url: SITE_URL,
				logo: `${SITE_URL}/icons/icon-512x512.png`,
				email: "support@ideapick.ru",
			},
			{
				"@type": "WebSite",
				"@id": websiteId,
				url: SITE_URL,
				name: "Ideapick",
				description: LANDING_DESCRIPTION,
				inLanguage: "ru-RU",
				publisher: { "@id": orgId },
			},
			{
				"@type": "SoftwareApplication",
				"@id": appId,
				name: "Ideapick",
				url: SITE_URL,
				applicationCategory: "BusinessApplication",
				operatingSystem: "Web",
				inLanguage: "ru-RU",
				description: LANDING_DESCRIPTION,
				offers: {
					"@type": "Offer",
					price: String(PRICES.analysis),
					priceCurrency: "RUB",
					description: "AI-анализ бизнес-идеи, без подписки",
				},
				publisher: { "@id": orgId },
			},
			{
				"@type": "FAQPage",
				"@id": `${SITE_URL}/#faq`,
				mainEntity: LANDING_FAQ_ITEMS.map((item) => ({
					"@type": "Question",
					name: item.q,
					acceptedAnswer: {
						"@type": "Answer",
						text: item.a,
					},
				})),
			},
		],
	};
}
