import { buildLandingJsonLd } from "@/lib/landing/json-ld";

export function LandingJsonLd() {
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(buildLandingJsonLd()),
			}}
		/>
	);
}
