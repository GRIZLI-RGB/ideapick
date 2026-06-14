import type { Metadata } from "next";
import { LandingV2Content } from "@/components/landing-v2/landing-content";
import { LandingJsonLd } from "@/components/landing-v2/landing-json-ld";

const LANDING_TITLE = "Ideapick — узнайте, стоит ли браться за идею";
const LANDING_DESCRIPTION =
	"Опишите идею в нескольких предложениях — Ideapick оценит спрос, конкуренцию, монетизацию и риски, выдаст вердикт 0–100 и план первых шагов. Первый анализ — бесплатно.";

export const metadata: Metadata = {
	title: { absolute: LANDING_TITLE },
	description: LANDING_DESCRIPTION,
	alternates: { canonical: "/" },
	openGraph: {
		title: LANDING_TITLE,
		description: LANDING_DESCRIPTION,
		url: "/",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: LANDING_TITLE,
		description: LANDING_DESCRIPTION,
	},
};

export default function LandingPage() {
	return (
		<>
			<LandingJsonLd />
			<LandingV2Content />
		</>
	);
}
