import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { PrivacyContent } from "@/components/legal/privacy-content";
import { getLegalPage } from "@/lib/legal";
import type { Metadata } from "next";

const page = getLegalPage("/privacy")!;

export const metadata: Metadata = {
	title: page.title,
	description: page.description,
	alternates: { canonical: page.href },
	openGraph: {
		title: `${page.title} — Ideapick`,
		description: page.description,
		url: page.href,
		type: "article",
	},
	twitter: {
		card: "summary",
		title: `${page.title} — Ideapick`,
		description: page.description,
	},
};

export default function PrivacyPage() {
	return (
		<LegalPageShell
			title={page.title}
			description={page.description}
			currentHref={page.href}
		>
			<PrivacyContent />
		</LegalPageShell>
	);
}
