"use client";

import type { AnalysisReport } from "@/lib/analysis/types";
import type { ReportSectionKey } from "@/lib/analysis/section-meta";
import { SATURATION_LABEL, COMPLEXITY_LABEL } from "@/lib/analysis/section-meta";
import { sectionTeaser } from "@/lib/analysis/report-helpers";
import {
	levelForSection,
	ReportHero,
	ReportSectionList,
	ReportSectionSheet,
	useFactorMap,
	useReportSectionSheet,
} from "@/components/ideas/detail/idea-report-layout";
import {
	TONE_TEXT_CLASS,
	toneFromLevel,
	type FactorTone,
} from "@/lib/analysis/visual-metrics";

type IdeaAnalysisReportProps = {
	report: AnalysisReport;
};

const TONE_BADGE_CLASS: Record<FactorTone, string> = {
	strong: "border-emerald-500/25 bg-emerald-500/10",
	ok: "border-amber-500/25 bg-amber-500/10",
	weak: "border-sky-500/25 bg-sky-500/10",
	poor: "border-rose-500/25 bg-rose-500/10",
};

function enumBadge(key: ReportSectionKey, report: AnalysisReport): string | null {
	switch (key) {
		case "competition":
			return SATURATION_LABEL[report.competition.saturation];
		case "execution":
			return COMPLEXITY_LABEL[report.execution.complexity];
		case "nextSteps":
			return `${report.nextSteps.bullets.length} шагов`;
		default:
			return null;
	}
}

export function IdeaAnalysisReport({ report }: IdeaAnalysisReportProps) {
	const { sectionKey, openSection, closeSection } = useReportSectionSheet();
	const factorMap = useFactorMap(report);

	return (
		<>
			<div className="space-y-4">
				<ReportHero report={report} onRadarAxisClick={openSection} />
				<ReportSectionList
					report={report}
					onSelect={openSection}
					renderTrailing={(key) => {
						const level = levelForSection(key, report, factorMap);
						const tone = factorMap[key]?.tone ?? toneFromLevel(level);
						const enumLabel = enumBadge(key, report);
						const label = enumLabel ?? factorMap[key]?.shortLabel ?? `${level}`;

						return (
							<span
								className={`hidden shrink-0 rounded-lg border px-2 py-1 text-[10px] font-semibold sm:inline ${TONE_BADGE_CLASS[tone]} ${TONE_TEXT_CLASS[tone]}`}
							>
								{label}
							</span>
						);
					}}
					renderSubline={(key) => (
						<p className="mt-0.5 line-clamp-1 text-xs text-stone-500">
							{sectionTeaser(key, report)}
						</p>
					)}
				/>
			</div>
			<ReportSectionSheet
				report={report}
				sectionKey={sectionKey}
				onClose={closeSection}
			/>
		</>
	);
}
