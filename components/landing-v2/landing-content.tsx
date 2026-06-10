import { LandingNav } from "@/components/landing-v2/landing-nav";
import { Hero } from "@/components/landing-v2/hero";
import { HowItWorks } from "@/components/landing-v2/how-it-works";
import { IdeaSources } from "@/components/landing-v2/idea-sources";
import { ExampleReport } from "@/components/landing-v2/example-report";
import { ScoreBands } from "@/components/landing-v2/score-bands";
import { WhyNotChatGpt } from "@/components/landing-v2/why-not-chatgpt";
import { Pricing } from "@/components/landing-v2/pricing";
import { Faq } from "@/components/landing-v2/faq";
import { FinalCta } from "@/components/landing-v2/final-cta";
import { LandingFooter } from "@/components/landing-v2/landing-footer";
import { LandingShell } from "@/components/landing-v2/landing-shell";

export function LandingV2Content() {
	return (
		<LandingShell>
			<LandingNav />
			<main>
				<Hero />
				<HowItWorks />
				<IdeaSources />
				<ExampleReport />
				<ScoreBands />
				<WhyNotChatGpt />
				<Pricing />
				<Faq />
				<FinalCta />
			</main>
			<LandingFooter />
		</LandingShell>
	);
}
