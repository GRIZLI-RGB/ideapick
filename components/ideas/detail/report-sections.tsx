"use client";

import type { AnalysisReport } from "@/lib/analysis/types";
import {
	COMPLEXITY_LABEL,
	REPORT_SECTIONS,
	SATURATION_LABEL,
} from "@/lib/analysis/section-meta";
import { BulletList } from "@/components/ideas/detail/idea-detail-shared";

type ReportSectionBodyProps = {
	sectionKey: (typeof REPORT_SECTIONS)[number]["key"];
	report: AnalysisReport;
};

export function ReportSectionBody({ sectionKey, report }: ReportSectionBodyProps) {
	switch (sectionKey) {
		case "demand":
			return (
				<div className="space-y-3">
					<p className="text-sm text-stone-400">
						<span className="text-stone-500">Аудитория: </span>
						{report.demand.audience}
					</p>
					<BulletList items={report.demand.bullets} />
				</div>
			);
		case "competition":
			return (
				<div className="space-y-3">
					<span className="inline-flex rounded-full bg-stone-800/80 px-2.5 py-0.5 text-xs text-stone-400 ring-1 ring-stone-700/80">
						{SATURATION_LABEL[report.competition.saturation]}
					</span>
					<BulletList items={report.competition.bullets} />
				</div>
			);
		case "monetization":
			return <BulletList items={report.monetization.bullets} />;
		case "execution":
			return (
				<div className="space-y-3">
					<span className="inline-flex rounded-full bg-stone-800/80 px-2.5 py-0.5 text-xs text-stone-400 ring-1 ring-stone-700/80">
						{COMPLEXITY_LABEL[report.execution.complexity]}
					</span>
					<BulletList items={report.execution.bullets} />
				</div>
			);
		case "risks":
			return <BulletList items={report.risks.bullets} />;
		case "nextSteps":
			return <BulletList items={report.nextSteps.bullets} />;
	}
}
