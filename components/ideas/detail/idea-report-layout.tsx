"use client";

import type { AnalysisReport } from "@/lib/analysis/types";
import type { ReportSectionKey } from "@/lib/analysis/section-meta";
import { REPORT_SECTIONS } from "@/lib/analysis/section-meta";
import { sectionTeaser } from "@/lib/analysis/report-helpers";
import {
	AnalysisMeta,
	PANEL,
	ScoreHero,
} from "@/components/ideas/detail/idea-detail-shared";
import { SectionDetailSheet } from "@/components/ideas/detail/section-detail-sheet";
import {
	RADAR_SECTION_KEYS,
	RadarChart,
} from "@/components/ideas/detail/visual/radar-chart";
import { radarValues, visualFactors, type VisualFactor } from "@/lib/analysis/visual-metrics";
import { ChevronRight } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

export function useReportSectionSheet() {
	const [sectionKey, setSectionKey] = useState<ReportSectionKey | null>(null);
	return {
		sectionKey,
		openSection: setSectionKey,
		closeSection: () => setSectionKey(null),
	};
}

export function useFactorMap(report: AnalysisReport) {
	return useMemo(() => {
		const factors = visualFactors(report);
		return Object.fromEntries(factors.map((f) => [f.key, f])) as Partial<
			Record<ReportSectionKey, VisualFactor>
		>;
	}, [report]);
}

export function levelForSection(
	key: ReportSectionKey,
	report: AnalysisReport,
	factorMap: Partial<Record<ReportSectionKey, VisualFactor>>,
): number {
	const f = factorMap[key];
	if (f) return f.level;
	if (key === "nextSteps") {
		return Math.min(90, 40 + report.nextSteps.bullets.length * 15);
	}
	return 50;
}

type ReportHeroProps = {
	report: AnalysisReport;
	onRadarAxisClick: (key: ReportSectionKey) => void;
};

export function ReportHero({ report, onRadarAxisClick }: ReportHeroProps) {
	const radar = radarValues(report);

	return (
		<div className={`${PANEL} p-4 sm:p-5`}>
			<div className="flex flex-col gap-5 sm:flex-row sm:items-stretch sm:gap-6">
				<div className="flex min-w-0 flex-1 flex-col gap-4 sm:justify-between">
					<ScoreHero score={report.score} />
					<div className="min-w-0">
						<p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
							Краткий вывод
						</p>
						<p className="mt-2 text-sm leading-relaxed text-stone-300">
							{report.summary}
						</p>
					</div>
					<AnalysisMeta report={report} />
				</div>

				<div className="flex min-h-[200px] w-full shrink-0 justify-center pr-1 sm:h-auto sm:min-h-0 sm:w-[min(38%,13rem)] sm:justify-start sm:pr-2">
					<RadarChart
						values={radar}
						className="h-full max-h-full w-full max-w-[calc(100%-0.5rem)]"
						onAxisClick={(i) => onRadarAxisClick(RADAR_SECTION_KEYS[i])}
					/>
				</div>
			</div>
		</div>
	);
}

type ReportSectionListProps = {
	report: AnalysisReport;
	onSelect: (key: ReportSectionKey) => void;
	renderTrailing?: (
		key: ReportSectionKey,
		report: AnalysisReport,
	) => ReactNode;
	renderSubline?: (
		key: ReportSectionKey,
		report: AnalysisReport,
	) => ReactNode;
};

export function ReportSectionList({
	report,
	onSelect,
	renderTrailing,
	renderSubline,
}: ReportSectionListProps) {
	return (
		<div className={`${PANEL} overflow-hidden`}>
			<ul>
				{REPORT_SECTIONS.map(({ key, label, icon: Icon }, i) => (
					<li key={key}>
						<button
							type="button"
							onClick={() => onSelect(key)}
							className="flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left transition hover:bg-stone-800/30 sm:px-5"
						>
							<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-stone-800/80">
								<Icon className="size-4 text-amber-400/90" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-stone-100">{label}</p>
								{renderSubline ? (
									renderSubline(key, report)
								) : (
									<p className="mt-0.5 line-clamp-1 text-xs text-stone-500">
										{sectionTeaser(key, report)}
									</p>
								)}
							</div>
							{renderTrailing ? renderTrailing(key, report) : null}
							<ChevronRight className="size-4 shrink-0 text-stone-600" />
						</button>
						{i < REPORT_SECTIONS.length - 1 ? (
							<div className="mx-4 border-b border-stone-800/60 sm:mx-5" />
						) : null}
					</li>
				))}
			</ul>
		</div>
	);
}

type ReportSectionSheetProps = {
	report: AnalysisReport;
	sectionKey: ReportSectionKey | null;
	onClose: () => void;
};

export function ReportSectionSheet({
	report,
	sectionKey,
	onClose,
}: ReportSectionSheetProps) {
	return (
		<SectionDetailSheet
			report={report}
			sectionKey={sectionKey}
			onClose={onClose}
		/>
	);
}
