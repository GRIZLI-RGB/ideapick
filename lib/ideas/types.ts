export type Idea = {
	id: string;
	title: string;
	description: string;
	score: number | null;
	createdAt: string;
	hasAnalysis: boolean;
};

export type AnalysisFilter = "all" | "analyzed" | "pending";

export type SortOption = "newest" | "oldest" | "score" | "name";

export type AddIdeaMode = "create" | "random" | "anamnesis";
