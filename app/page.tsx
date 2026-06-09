import type { Metadata } from "next";
import { LandingShell } from "@/components/landing-v2/landing-shell";
import { LandingNav } from "@/components/landing-v2/landing-nav";
import { Hero } from "@/components/landing-v2/hero";
import { HowItWorks } from "@/components/landing-v2/how-it-works";
import { IdeaSources } from "@/components/landing-v2/idea-sources";
import { ExampleReport } from "@/components/landing-v2/example-report";
import { ScoreBands } from "@/components/landing-v2/score-bands";
import { Pricing } from "@/components/landing-v2/pricing";
import { Faq } from "@/components/landing-v2/faq";
import { FinalCta } from "@/components/landing-v2/final-cta";
import { LandingFooter } from "@/components/landing-v2/landing-footer";

/**
 * Тестовая версия лендинга (v2).
 * Закрыта от индексации — это черновик для сравнения с текущей главной.
 */
export const metadata: Metadata = {
	title: "IdeaPick — узнайте, стоит ли браться за идею",
	description:
		"Опишите идею в двух предложениях — IdeaPick оценит спрос, конкуренцию, монетизацию и риски, выдаст вердикт 0–100 и план первых шагов. Первый анализ — бесплатно.",
	robots: { index: false, follow: false },
};

export default function LandingV2Page() {
	return (
		<LandingShell>
			<LandingNav />
			<main>
				<Hero />
				<HowItWorks />
				<IdeaSources />
				<ExampleReport />
				<ScoreBands />
				<Pricing />
				<Faq />
				<FinalCta />
			</main>
			<LandingFooter />
		</LandingShell>
	);
}
