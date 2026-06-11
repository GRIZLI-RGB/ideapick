"use client";

import { RANDOM_DAILY_LIMIT, PRICES } from "@/lib/ideas/constants";
import {
	ANAMNESIS_RESULT_POOL,
	CATALOG_POOL,
} from "@/lib/ideas/mock-data";
import type {
	AddIdeaMode,
	AnalysisFilter,
	Idea,
	SortOption,
} from "@/lib/ideas/types";
import { TOP_UP_MAX, TOP_UP_MIN } from "@/lib/wallet/bonus";
import type { Transaction } from "@/lib/wallet/types";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";

export type ToastKind = "success" | "error" | "info";

export type Toast = {
	/** Уникальный id — перезапускает анимацию при замене тоста на новый. */
	id: number;
	message: string;
	kind: ToastKind;
};

/** Время жизни тоста; с ним же синхронизирована полоска-таймер в DemoToast. */
export const TOAST_DURATION_MS = 3200;

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
	toast: Toast | null;
	setFilter: (f: AnalysisFilter) => void;
	setSort: (s: SortOption) => void;
	openDialog: (mode: AddIdeaMode) => void;
	closeDialog: () => void;
	openWallet: () => void;
	closeWallet: () => void;
	topUp: (amount: number) => Promise<boolean>;
	createIdea: (title: string, description: string) => Promise<boolean>;
	deleteIdea: (id: string) => Promise<boolean>;
	addRandomIdea: () => Promise<boolean>;
	addAnamnesisIdeas: () => Promise<boolean>;
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

let txCounter = 100;

function nextTxId() {
	return `tx${++txCounter}`;
}

type IdeasDemoProviderProps = {
	children: ReactNode;
	/** Реальный баланс из БД (приветственный бонус + пополнения). */
	initialBalance: number;
	/** Реальная история операций из БД. */
	initialTransactions: Transaction[];
	/** Реальные идеи пользователя из БД. */
	initialIdeas: Idea[];
};

export function IdeasDemoProvider({
	children,
	initialBalance,
	initialTransactions,
	initialIdeas,
}: IdeasDemoProviderProps) {
	const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
	const [balance, setBalance] = useState(initialBalance);
	const [transactions, setTransactions] =
		useState<Transaction[]>(initialTransactions);
	const [walletOpen, setWalletOpen] = useState(false);
	const [randomUsedToday, setRandomUsedToday] = useState(1);
	const [filter, setFilter] = useState<AnalysisFilter>("all");
	const [sort, setSort] = useState<SortOption>("newest");
	const [activeDialog, setActiveDialog] = useState<AddIdeaMode | null>(null);
	const [toast, setToast] = useState<Toast | null>(null);
	const [catalogIdx, setCatalogIdx] = useState(0);
	const [anamnesisIdx, setAnamnesisIdx] = useState(0);
	const toastCounter = useRef(0);
	const toastTimer = useRef<number | undefined>(undefined);

	useEffect(() => () => window.clearTimeout(toastTimer.current), []);

	const showToast = useCallback((message: string, kind: ToastKind = "info") => {
		window.clearTimeout(toastTimer.current);
		setToast({ id: ++toastCounter.current, message, kind });
		toastTimer.current = window.setTimeout(
			() => setToast(null),
			TOAST_DURATION_MS,
		);
	}, []);

	const appendTransaction = useCallback((tx: Omit<Transaction, "id">) => {
		setTransactions((prev) => [
			{ ...tx, id: nextTxId(), createdAt: tx.createdAt ?? new Date().toISOString() },
			...prev,
		]);
	}, []);

	// Результат возврата с оплаты (?topup=success|pending|canceled). Баланс уже
	// пришёл свежим из БД (SSR), здесь только тост + очистка параметра в URL.
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const flag = params.get("topup");
		if (!flag) return;

		params.delete("topup");
		const query = params.toString();
		window.history.replaceState(
			null,
			"",
			window.location.pathname + (query ? `?${query}` : ""),
		);

		const result: { message: string; kind: ToastKind } | null =
			flag === "success"
				? { message: "Баланс пополнен", kind: "success" }
				: flag === "pending"
					? {
							message:
								"Платёж в обработке — баланс обновится после подтверждения",
							kind: "info",
						}
					: flag === "canceled"
						? { message: "Платёж отменён", kind: "info" }
						: null;
		if (!result) return;
		// Тост — вне фазы коммита эффекта (избегаем каскадных ре-рендеров).
		const id = setTimeout(() => showToast(result.message, result.kind), 0);
		return () => clearTimeout(id);
	}, [showToast]);

	/**
	 * Создаёт платёж через ЮKassa и редиректит на страницу оплаты. Зачисление
	 * происходит на сервере при подтверждении (capture); после возврата страница
	 * перезагружается и баланс приходит свежим из БД.
	 */
	const topUp = useCallback(
		async (amount: number) => {
			if (
				!Number.isInteger(amount) ||
				amount < TOP_UP_MIN ||
				amount > TOP_UP_MAX
			)
				return false;
			try {
				const res = await fetch("/api/wallet/topup", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						amount,
						returnPath: window.location.pathname,
					}),
				});
				if (!res.ok) {
					const data = (await res.json().catch(() => ({}))) as {
						error?: string;
					};
					showToast(data.error ?? "Не удалось создать платёж", "error");
					return false;
				}
				const { confirmationUrl } = (await res.json()) as {
					confirmationUrl: string;
				};
				window.location.href = confirmationUrl;
				return true;
			} catch {
				showToast("Сеть недоступна — попробуйте позже", "error");
				return false;
			}
		},
		[showToast],
	);

	/**
	 * Сохраняет идею в БД через API и добавляет её в начало списка. Возвращает
	 * созданную идею или null при ошибке (с тостом).
	 */
	const persistIdea = useCallback(
		async (
			title: string,
			description: string,
			source: "manual" | "catalog" | "anamnesis",
		): Promise<Idea | null> => {
			try {
				const res = await fetch("/api/ideas", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ title, description, source }),
				});
				if (!res.ok) {
					const data = (await res.json().catch(() => ({}))) as {
						error?: string;
					};
					showToast(data.error ?? "Не удалось сохранить идею", "error");
					return null;
				}
				const { idea } = (await res.json()) as { idea: Idea };
				setIdeas((prev) => [idea, ...prev]);
				return idea;
			} catch {
				showToast("Сеть недоступна — попробуйте позже", "error");
				return null;
			}
		},
		[showToast],
	);

	const createIdea = useCallback(
		async (title: string, description: string) => {
			const idea = await persistIdea(title, description, "manual");
			if (!idea) return false;
			setActiveDialog(null);
			showToast("Идея добавлена", "success");
			return true;
		},
		[persistIdea, showToast],
	);

	const deleteIdea = useCallback(
		async (id: string) => {
			const snapshot = ideas;
			setIdeas((prev) => prev.filter((i) => i.id !== id));
			try {
				const res = await fetch(`/api/ideas/${id}`, { method: "DELETE" });
				if (!res.ok) {
					setIdeas(snapshot);
					showToast("Не удалось удалить идею", "error");
					return false;
				}
				showToast("Идея удалена", "success");
				return true;
			} catch {
				setIdeas(snapshot);
				showToast("Сеть недоступна — попробуйте позже", "error");
				return false;
			}
		},
		[ideas, showToast],
	);

	const addRandomIdea = useCallback(async () => {
		if (randomUsedToday >= RANDOM_DAILY_LIMIT) return false;
		const template = CATALOG_POOL[catalogIdx % CATALOG_POOL.length];
		const idea = await persistIdea(
			template.title,
			template.description,
			"catalog",
		);
		if (!idea) return false;
		setCatalogIdx((i) => i + 1);
		setRandomUsedToday((n) => n + 1);
		setActiveDialog(null);
		showToast("Идея из каталога добавлена", "success");
		return true;
	}, [catalogIdx, randomUsedToday, persistIdea, showToast]);

	const addAnamnesisIdeas = useCallback(async () => {
		const price = PRICES.anamnesis;
		if (balance < price) return false;
		const template =
			ANAMNESIS_RESULT_POOL[anamnesisIdx % ANAMNESIS_RESULT_POOL.length];
		const idea = await persistIdea(
			template.title,
			template.description,
			"anamnesis",
		);
		if (!idea) return false;
		setAnamnesisIdx((i) => i + 1);
		// NOTE: списание баланса пока косметическое (без записи в БД) — реальная
		// тарификация генерации появится вместе с биллингом анализа.
		setBalance((b) => b - price);
		appendTransaction({
			kind: "anamnesis",
			amount: -price,
			label: "Идея по анамнезу",
			createdAt: new Date().toISOString(),
		});
		setActiveDialog(null);
		showToast(`Идея по анамнезу сгенерирована · −${price} ₽`, "success");
		return true;
	}, [anamnesisIdx, balance, appendTransaction, persistIdea, showToast]);

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
		deleteIdea,
		addRandomIdea,
		addAnamnesisIdeas,
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
