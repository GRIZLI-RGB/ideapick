import type { Metadata } from "next";
import { LandingShell } from "@/components/landing/landing-shell";
import { LandingNav } from "@/components/landing/landing-nav";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { IdeaSources } from "@/components/landing/idea-sources";
import { ReportSections } from "@/components/landing/report-sections";
import { ScoreBands } from "@/components/landing/score-bands";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

export const metadata: Metadata = {
	title: "Ideapick — AI-оценка бизнес-идей за минуту",
	description:
		"Опишите идею в паре предложений — IdeaPick оценит спрос, конкуренцию, монетизацию и риски, выдаст рейтинг 0–100 и отчёт с первыми шагами. +100 ₽ при регистрации.",
	alternates: { canonical: "/" },
};

export default function LandingPage() {
	return (
		<LandingShell>
			<LandingNav />
			<main>
				<Hero />
				<HowItWorks />
				<IdeaSources />
				<ReportSections />
				<ScoreBands />
				<Pricing />
				<Faq />
				<FinalCta />
			</main>
			<LandingFooter />
		</LandingShell>
	);
}
