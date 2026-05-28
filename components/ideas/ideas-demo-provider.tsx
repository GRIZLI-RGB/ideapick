"use client";

import { RANDOM_DAILY_LIMIT } from "@/lib/ideas/constants";
import {
	ANAMNESIS_RESULT_POOL,
	CATALOG_POOL,
	INITIAL_IDEAS,
	MOCK_BALANCE,
} from "@/lib/ideas/mock-data";
import type {
	AddIdeaMode,
	AnalysisFilter,
	Idea,
	SortOption,
} from "@/lib/ideas/types";
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from "react";

type IdeasDemoContextValue = {
	ideas: Idea[];
	balance: number;
	randomUsedToday: number;
	randomLimit: number;
	filter: AnalysisFilter;
	sort: SortOption;
	activeDialog: AddIdeaMode | null;
	toast: string | null;
	setFilter: (f: AnalysisFilter) => void;
	setSort: (s: SortOption) => void;
	openDialog: (mode: AddIdeaMode) => void;
	closeDialog: () => void;
	createIdea: (title: string, description: string) => void;
	addRandomIdea: () => boolean;
	addAnamnesisIdeas: () => boolean;
	clearToast: () => void;
	resetForEmptyDemo: () => void;
	filteredIdeas: Idea[];
	stats: { total: number; analyzed: number; pending: number };
};

const IdeasDemoContext = createContext<IdeasDemoContextValue | null>(null);

function sortIdeas(ideas: Idea[], sort: SortOption): Idea[] {
	const copy = [...ideas];
	switch (sort) {
		case "newest":
			return copy.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
			);
		case "oldest":
			return copy.sort(
				(a, b) =>
					new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
			);
		case "score":
			return copy.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
		case "name":
			return copy.sort((a, b) => a.title.localeCompare(b.title, "ru"));
	}
}

function filterIdeas(ideas: Idea[], filter: AnalysisFilter): Idea[] {
	switch (filter) {
		case "analyzed":
			return ideas.filter((i) => i.hasAnalysis);
		case "pending":
			return ideas.filter((i) => !i.hasAnalysis);
		default:
			return ideas;
	}
}

let idCounter = 100;

type IdeasDemoProviderProps = {
	children: ReactNode;
};

export function IdeasDemoProvider({ children }: IdeasDemoProviderProps) {
	const [ideas, setIdeas] = useState<Idea[]>(INITIAL_IDEAS);
	const [balance, setBalance] = useState(MOCK_BALANCE);
	const [randomUsedToday, setRandomUsedToday] = useState(1);
	const [filter, setFilter] = useState<AnalysisFilter>("all");
	const [sort, setSort] = useState<SortOption>("newest");
	const [activeDialog, setActiveDialog] = useState<AddIdeaMode | null>(null);
	const [toast, setToast] = useState<string | null>(null);
	const [catalogIdx, setCatalogIdx] = useState(0);
	const [anamnesisIdx, setAnamnesisIdx] = useState(0);

	const showToast = useCallback((msg: string) => {
		setToast(msg);
		setTimeout(() => setToast(null), 3200);
	}, []);

	const createIdea = useCallback((title: string, description: string) => {
		const idea: Idea = {
			id: String(++idCounter),
			title: title.trim(),
			description: description.trim(),
			verdict: null,
			score: null,
			tag: null,
			createdAt: new Date().toISOString(),
			hasAnalysis: false,
		};
		setIdeas((prev) => [idea, ...prev]);
		setActiveDialog(null);
		showToast("Идея добавлена");
	}, [showToast]);

	const addRandomIdea = useCallback(() => {
		if (randomUsedToday >= RANDOM_DAILY_LIMIT) return false;
		const template = CATALOG_POOL[catalogIdx % CATALOG_POOL.length];
		setCatalogIdx((i) => i + 1);
		const idea: Idea = {
			...template,
			id: String(++idCounter),
			createdAt: new Date().toISOString(),
		};
		setIdeas((prev) => [idea, ...prev]);
		setRandomUsedToday((n) => n + 1);
		setActiveDialog(null);
		showToast("Идея из каталога добавлена");
		return true;
	}, [catalogIdx, randomUsedToday, showToast]);

	const addAnamnesisIdeas = useCallback(() => {
		if (balance < 49) return false;
		const template = ANAMNESIS_RESULT_POOL[anamnesisIdx % ANAMNESIS_RESULT_POOL.length];
		setAnamnesisIdx((i) => i + 1);
		const idea: Idea = {
			...template,
			id: String(++idCounter),
			createdAt: new Date().toISOString(),
		};
		setIdeas((prev) => [idea, ...prev]);
		setBalance((b) => b - 49);
		setActiveDialog(null);
		showToast("Идея по анамнезу сгенерирована · −49 ₽");
		return true;
	}, [anamnesisIdx, balance, showToast]);

	const resetForEmptyDemo = useCallback(() => {
		setIdeas([]);
	}, []);

	const filteredIdeas = useMemo(
		() => sortIdeas(filterIdeas(ideas, filter), sort),
		[ideas, filter, sort],
	);

	const stats = useMemo(
		() => ({
			total: ideas.length,
			analyzed: ideas.filter((i) => i.hasAnalysis).length,
			pending: ideas.filter((i) => !i.hasAnalysis).length,
		}),
		[ideas],
	);

	const value: IdeasDemoContextValue = {
		ideas,
		balance,
		randomUsedToday,
		randomLimit: RANDOM_DAILY_LIMIT,
		filter,
		sort,
		activeDialog,
		toast,
		setFilter,
		setSort,
		openDialog: setActiveDialog,
		closeDialog: () => setActiveDialog(null),
		createIdea,
		addRandomIdea,
		addAnamnesisIdeas,
		clearToast: () => setToast(null),
		resetForEmptyDemo,
		filteredIdeas,
		stats,
	};

	return (
		<IdeasDemoContext.Provider value={value}>
			{children}
		</IdeasDemoContext.Provider>
	);
}

export function useIdeasDemo() {
	const ctx = useContext(IdeasDemoContext);
	if (!ctx) throw new Error("useIdeasDemo must be used within IdeasDemoProvider");
	return ctx;
}
