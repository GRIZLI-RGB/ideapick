import type { Metadata } from "next";
import { LandingV2Content } from "@/components/landing-v2/landing-content";
import { LandingJsonLd } from "@/components/landing-v2/landing-json-ld";

export const metadata: Metadata = {
	title: "Ideapick — узнайте, стоит ли браться за идею",
	description:
		"Опишите идею в двух предложениях — Ideapick оценит спрос, конкуренцию, монетизацию и риски, выдаст вердикт 0–100 и план первых шагов. Первый анализ — бесплатно.",
	alternates: { canonical: "/" },
};

export default function LandingPage() {
	return (
		<>
			<LandingJsonLd />
			<LandingV2Content />
		</>
	);
}
