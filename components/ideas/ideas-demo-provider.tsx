"use client";

import { RANDOM_DAILY_LIMIT, PRICES } from "@/lib/ideas/constants";
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
	calcTopUpBonus,
	calcTopUpTotal,
	TOP_UP_MAX,
	TOP_UP_MIN,
} from "@/lib/wallet/bonus";
import { INITIAL_TRANSACTIONS } from "@/lib/wallet/mock-data";
import type { Transaction } from "@/lib/wallet/types";
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
	transactions: Transaction[];
	walletOpen: boolean;
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
	openWallet: () => void;
	closeWallet: () => void;
	topUp: (amount: number) => Promise<boolean>;
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
let txCounter = 100;

function nextTxId() {
	return `tx${++txCounter}`;
}

type IdeasDemoProviderProps = {
	children: ReactNode;
};

export function IdeasDemoProvider({ children }: IdeasDemoProviderProps) {
	const [ideas, setIdeas] = useState<Idea[]>(INITIAL_IDEAS);
	const [balance, setBalance] = useState(MOCK_BALANCE);
	const [transactions, setTransactions] = useState<Transaction[]>(
		INITIAL_TRANSACTIONS,
	);
	const [walletOpen, setWalletOpen] = useState(false);
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

	const appendTransaction = useCallback((tx: Omit<Transaction, "id">) => {
		setTransactions((prev) => [
			{ ...tx, id: nextTxId(), createdAt: tx.createdAt ?? new Date().toISOString() },
			...prev,
		]);
	}, []);

	const topUp = useCallback(
		async (amount: number) => {
			if (amount < TOP_UP_MIN || amount > TOP_UP_MAX) return false;
			const bonus = calcTopUpBonus(amount);
			const total = calcTopUpTotal(amount);
			await new Promise((r) => setTimeout(r, 700));
			setBalance((b) => b + total);
			const label =
				bonus > 0
					? `Пополнение · +${bonus} ₽ бонус`
					: "Пополнение";
			appendTransaction({
				kind: "topup",
				amount: total,
				label,
				createdAt: new Date().toISOString(),
			});
			showToast(
				bonus > 0
					? `Зачислено ${total} ₽ (включая бонус ${bonus} ₽)`
					: `Зачислено ${total} ₽`,
			);
			return true;
		},
		[appendTransaction, showToast],
	);

	const createIdea = useCallback(
		(title: string, description: string) => {
			const idea: Idea = {
				id: String(++idCounter),
				title: title.trim(),
				description: description.trim(),
				score: null,
				createdAt: new Date().toISOString(),
				hasAnalysis: false,
			};
			setIdeas((prev) => [idea, ...prev]);
			setActiveDialog(null);
			showToast("Идея добавлена");
		},
		[showToast],
	);

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
		const price = PRICES.anamnesis;
		if (balance < price) return false;
		const template =
			ANAMNESIS_RESULT_POOL[anamnesisIdx % ANAMNESIS_RESULT_POOL.length];
		setAnamnesisIdx((i) => i + 1);
		const idea: Idea = {
			...template,
			id: String(++idCounter),
			createdAt: new Date().toISOString(),
		};
		setIdeas((prev) => [idea, ...prev]);
		setBalance((b) => b - price);
		appendTransaction({
			kind: "anamnesis",
			amount: -price,
			label: "Идея по анамнезу",
			createdAt: new Date().toISOString(),
		});
		setActiveDialog(null);
		showToast(`Идея по анамнезу сгенерирована · −${price} ₽`);
		return true;
	}, [anamnesisIdx, balance, appendTransaction, showToast]);

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
		transactions,
		walletOpen,
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
		openWallet: () => setWalletOpen(true),
		closeWallet: () => setWalletOpen(false),
		topUp,
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
