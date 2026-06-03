import type { AnalysisReport } from "@/lib/analysis/types";
import type { ReportSectionKey } from "@/lib/analysis/section-meta";
import {
	COMPLEXITY_LABEL,
	REPORT_SECTIONS,
	SATURATION_LABEL,
} from "@/lib/analysis/section-meta";

export function sectionTeaser(
	key: ReportSectionKey,
	report: AnalysisReport,
): string {
	switch (key) {
		case "demand":
			return report.demand.audience;
		case "competition":
			return (
				report.competition.bullets[0] ??
				SATURATION_LABEL[report.competition.saturation]
			);
		case "monetization":
			return report.monetization.bullets[0] ?? "—";
		case "execution":
			return (
				report.execution.bullets[0] ??
				COMPLEXITY_LABEL[report.execution.complexity]
			);
		case "risks":
			return report.risks.bullets[0] ?? "—";
		case "nextSteps":
			return report.nextSteps.bullets[0] ?? "—";
	}
}

export function sectionMeta(key: ReportSectionKey) {
	return REPORT_SECTIONS.find((s) => s.key === key)!;
}
