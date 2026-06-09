import type { Metadata } from "next";
import { LandingV2Content } from "@/components/landing-v2/landing-content";

export const metadata: Metadata = {
	title: "IdeaPick — узнайте, стоит ли браться за идею",
	description:
		"Опишите идею в двух предложениях — IdeaPick оценит спрос, конкуренцию, монетизацию и риски, выдаст вердикт 0–100 и план первых шагов. Первый анализ — бесплатно.",
	alternates: { canonical: "/" },
};

export default function LandingPage() {
	return <LandingV2Content />;
}
