export type Verdict = "do" | "test" | "wait" | "skip";

export type Idea = {
	id: string;
	title: string;
	description: string;
	verdict: Verdict | null;
	score: number | null;
	tag: string | null;
	createdAt: string;
	hasAnalysis: boolean;
};

export type AnalysisFilter = "all" | "analyzed" | "pending";

export type SortOption = "newest" | "oldest" | "score" | "name";

export type AddIdeaMode = "create" | "random" | "anamnesis";
