export type { Verdict } from "@/lib/ideas/types";
export { VERDICTS } from "@/lib/ideas/constants";
export { LOGIN_DEMO_IDEAS as MOCK_IDEAS } from "@/lib/ideas/mock-data";

export type MockIdea = {
	title: string;
	desc: string;
	verdict: import("@/lib/ideas/types").Verdict;
	score: number;
	tag: string;
};
