"use client";

import type { RichAnalysisReport } from "@/lib/analysis/rich-types";
import type { AnamnesisExchange } from "@/lib/ideas/anamnesis";
import { PRICES } from "@/lib/ideas/constants";
import type {
	AddIdeaMode,
	AnalysisFilter,
	CatalogStatus,
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
	catalogStatus: CatalogStatus;
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
	setIdeaArchived: (id: string, archived: boolean) => Promise<boolean>;
	/**
	 * Списывает стоимость анализа и фиксирует операцию на сервере. Возвращает
	 * исход: «ok» — деньги списаны, «insufficient» — не хватает баланса,
	 * «error» — сетевая/серверная ошибка (тост уже показан).
	 */
	analyzeIdea: (
		id: string,
		mode?: "initial" | "update",
	) => Promise<"ok" | "insufficient" | "error">;
	addCatalogIdea: () => Promise<boolean>;
	/**
	 * Открывает оплаченную сессию опроса (предоплата до первого вопроса).
	 * Синхронизирует баланс/историю. Возвращает id сессии или null при ошибке.
	 */
	startAnamnesis: () => Promise<string | null>;
	/**
	 * Завершает опрос: генерирует идею по диалогу (оплата уже прошла на старте)
	 * и добавляет её в список. Возвращает идею или null при ошибке (тост показан).
	 */
	finishAnamnesis: (
		sessionId: string,
		history: AnamnesisExchange[],
	) => Promise<Idea | null>;
	filteredIdeas: Idea[];
	stats: {
		total: number;
		analyzed: number;
		pending: number;
		archived: number;
	};
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
		case "pending":
			return ideas.filter((i) => !i.archived && !i.hasAnalysis);
		case "archived":
			return ideas.filter((i) => i.archived);
		default:
			// Основной список — только активные; архив смотрят отдельным срезом.
			return ideas.filter((i) => !i.archived);
	}
}

type IdeasDemoProviderProps = {
	children: ReactNode;
	/** Реальный баланс из БД (приветственный бонус + пополнения). */
	initialBalance: number;
	/** Реальная история операций из БД. */
	initialTransactions: Transaction[];
	/** Реальные идеи пользователя из БД. */
	initialIdeas: Idea[];
	/** Реальное состояние каталога (дневной лимит + остаток пула) из БД. */
	initialCatalogStatus: CatalogStatus;
};

export function IdeasDemoProvider({
	children,
	initialBalance,
	initialTransactions,
	initialIdeas,
	initialCatalogStatus,
}: IdeasDemoProviderProps) {
	const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
	const [balance, setBalance] = useState(initialBalance);
	const [transactions, setTransactions] =
		useState<Transaction[]>(initialTransactions);
	const [walletOpen, setWalletOpen] = useState(false);
	const [catalogStatus, setCatalogStatus] = useState<CatalogStatus>(
		initialCatalogStatus,
	);
	const [filter, setFilter] = useState<AnalysisFilter>("all");
	const [sort, setSort] = useState<SortOption>("newest");
	const [activeDialog, setActiveDialog] = useState<AddIdeaMode | null>(null);
	const [toast, setToast] = useState<Toast | null>(null);
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

	/** Архив/возврат: оптимистичное обновление с откатом при ошибке API. */
	const setIdeaArchived = useCallback(
		async (id: string, archived: boolean) => {
			const snapshot = ideas;
			setIdeas((prev) =>
				prev.map((i) => (i.id === id ? { ...i, archived } : i)),
			);
			try {
				const res = await fetch(`/api/ideas/${id}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ archived }),
				});
				if (!res.ok) {
					setIdeas(snapshot);
					showToast(
						archived
							? "Не удалось перенести в архив"
							: "Не удалось вернуть из архива",
						"error",
					);
					return false;
				}
				showToast(
					archived
						? "Идея перенесена в архив"
						: "Идея возвращена из архива",
					"success",
				);
				return true;
			} catch {
				setIdeas(snapshot);
				showToast("Сеть недоступна — попробуйте позже", "error");
				return false;
			}
		},
		[ideas, showToast],
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

	/**
	 * Запускает анализ идеи: списывает стоимость и генерирует отчёт нейросетью
	 * на сервере. При успехе синхронизирует баланс, историю операций и сам отчёт
	 * в состоянии идеи. При сбое генерации деньги уже списаны (возврат вручную) —
	 * идея помечается как «failed».
	 */
	const analyzeIdea = useCallback(
		async (
			id: string,
			mode: "initial" | "update" = "initial",
		): Promise<"ok" | "insufficient" | "error"> => {
			const price = PRICES.analysis;
			if (balance < price) return "insufficient";
			try {
				const res = await fetch(`/api/ideas/${id}/analyze`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ mode }),
				});
				const data = (await res.json().catch(() => ({}))) as {
					error?: string;
					code?: string;
					balance?: number;
					transaction?: Transaction;
					report?: RichAnalysisReport;
				};

				if (res.status === 402) return "insufficient";

				// Списание прошло, но генерация упала — баланс/операция актуальны,
				// идею помечаем неуспешной, чтобы показать состояние ошибки.
				if (res.status === 502 && data.code === "generation") {
					if (typeof data.balance === "number") setBalance(data.balance);
					if (data.transaction) {
						const tx = data.transaction;
						setTransactions((prev) => [tx, ...prev]);
					}
					setIdeas((prev) =>
						prev.map((i) =>
							i.id === id ? { ...i, analysisStatus: "failed" } : i,
						),
					);
					showToast(data.error ?? "Анализ не удался", "error");
					return "error";
				}

				if (!res.ok || !data.report || typeof data.balance !== "number") {
					showToast(
						data.error ?? "Не удалось запустить анализ",
						"error",
					);
					return "error";
				}

				const report = data.report;
				const tx = data.transaction;
				setBalance(data.balance);
				if (tx) setTransactions((prev) => [tx, ...prev]);
				setIdeas((prev) =>
					prev.map((i) =>
						i.id === id
							? {
									...i,
									report,
									score: report.score,
									hasAnalysis: true,
									analysisStatus: "ok",
								}
							: i,
					),
				);
				return "ok";
			} catch {
				showToast("Сеть недоступна — попробуйте позже", "error");
				return "error";
			}
		},
		[balance, showToast],
	);

	/**
	 * Запрашивает бесплатную идею дня из каталога. Лимит и отсутствие повторов
	 * гарантирует сервер; здесь только синхронизация состояния и тосты.
	 */
	const addCatalogIdea = useCallback(async () => {
		if (catalogStatus.usedToday || catalogStatus.poolLeft <= 0) return false;
		try {
			const res = await fetch("/api/ideas/catalog", { method: "POST" });
			if (!res.ok) {
				const data = (await res.json().catch(() => ({}))) as {
					error?: string;
					code?: string;
				};
				// Сервер знает лучше: подтягиваем актуальное состояние лимита/пула.
				if (data.code === "limit") {
					setCatalogStatus((s) => ({ ...s, usedToday: true }));
				} else if (data.code === "empty") {
					setCatalogStatus((s) => ({ ...s, poolLeft: 0 }));
				}
				showToast(data.error ?? "Не удалось получить идею", "error");
				return false;
			}
			const { idea, status } = (await res.json()) as {
				idea: Idea;
				status: CatalogStatus;
			};
			setIdeas((prev) => [idea, ...prev]);
			setCatalogStatus(status);
			setActiveDialog(null);
			showToast("Идея из каталога добавлена", "success");
			return true;
		} catch {
			showToast("Сеть недоступна — попробуйте позже", "error");
			return false;
		}
	}, [catalogStatus, showToast]);

	/**
	 * Предоплата опроса: открывает (или переиспользует) оплаченную сессию.
	 * Списание происходит ДО первого вопроса. Возвращает id сессии или null.
	 */
	const startAnamnesis = useCallback(async (): Promise<string | null> => {
		if (balance < PRICES.anamnesis) {
			showToast("Недостаточно средств — пополните баланс", "error");
			return null;
		}
		try {
			const res = await fetch("/api/ideas/anamnesis/start", {
				method: "POST",
			});
			const data = (await res.json().catch(() => ({}))) as {
				error?: string;
				sessionId?: string;
				balance?: number;
				transaction?: Transaction | null;
			};
			if (res.status === 402) {
				showToast(
					data.error ?? "Недостаточно средств — пополните баланс",
					"error",
				);
				return null;
			}
			if (!res.ok || !data.sessionId || typeof data.balance !== "number") {
				showToast(data.error ?? "Не удалось начать подбор", "error");
				return null;
			}
			setBalance(data.balance);
			if (data.transaction) {
				const tx = data.transaction;
				setTransactions((prev) => [tx, ...prev]);
			}
			return data.sessionId;
		} catch {
			showToast("Сеть недоступна — попробуйте позже", "error");
			return null;
		}
	}, [balance, showToast]);

	/**
	 * Завершает опрос: генерирует идею по диалогу (оплата уже прошла на старте)
	 * и добавляет её в список. Модалку не закрывает — она показывает результат.
	 */
	const finishAnamnesis = useCallback(
		async (
			sessionId: string,
			history: AnamnesisExchange[],
		): Promise<Idea | null> => {
			try {
				const res = await fetch("/api/ideas/anamnesis", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ sessionId, history }),
				});
				const data = (await res.json().catch(() => ({}))) as {
					error?: string;
					idea?: Idea;
				};
				if (!res.ok || !data.idea) {
					showToast(data.error ?? "Не удалось подобрать идею", "error");
					return null;
				}
				const idea = data.idea;
				setIdeas((prev) => [idea, ...prev]);
				showToast("Идея по анамнезу готова", "success");
				return idea;
			} catch {
				showToast("Сеть недоступна — попробуйте позже", "error");
				return null;
			}
		},
		[showToast],
	);

	const filteredIdeas = useMemo(
		() => sortIdeas(filterIdeas(ideas, filter), sort),
		[ideas, filter, sort],
	);

	// Счётчики — по активным идеям; архив выводится отдельно.
	const stats = useMemo(() => {
		const active = ideas.filter((i) => !i.archived);
		return {
			total: active.length,
			analyzed: active.filter((i) => i.hasAnalysis).length,
			pending: active.filter((i) => !i.hasAnalysis).length,
			archived: ideas.length - active.length,
		};
	}, [ideas]);

	const value: IdeasDemoContextValue = {
		ideas,
		balance,
		transactions,
		walletOpen,
		catalogStatus,
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
		setIdeaArchived,
		analyzeIdea,
		addCatalogIdea,
		startAnamnesis,
		finishAnamnesis,
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
