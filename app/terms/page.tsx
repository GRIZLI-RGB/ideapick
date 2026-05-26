import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { TermsContent } from "@/components/legal/terms-content";
import { getLegalPage } from "@/lib/legal";
import type { Metadata } from "next";

const page = getLegalPage("/terms")!;

export const metadata: Metadata = {
	title: `${page.title} — Ideapick`,
	description: page.description,
};

export default function TermsPage() {
	return (
		<LegalPageShell
			title={page.title}
			description={page.description}
			currentHref={page.href}
		>
			<TermsContent />
		</LegalPageShell>
	);
}
