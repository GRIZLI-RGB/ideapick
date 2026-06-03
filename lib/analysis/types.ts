export type Saturation = "low" | "medium" | "high";
export type Complexity = "low" | "medium" | "high";

export type AnalysisReport = {
	score: number;
	scoreRationale: string;
	analyzedAt: string;
	summary: string;
	demand: {
		bullets: string[];
		audience: string;
	};
	competition: {
		bullets: string[];
		saturation: Saturation;
	};
	monetization: {
		bullets: string[];
	};
	execution: {
		bullets: string[];
		complexity: Complexity;
	};
	risks: {
		bullets: string[];
	};
	nextSteps: {
		bullets: string[];
	};
};
