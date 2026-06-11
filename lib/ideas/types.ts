export type Idea = {
	id: string;
	title: string;
	description: string;
	score: number | null;
	createdAt: string;
	hasAnalysis: boolean;
	/** Архивная идея скрыта из основного списка, но не удалена. */
	archived: boolean;
};

/** «all» и «pending» — только активные идеи; архив — отдельный срез. */
export type AnalysisFilter = "all" | "pending" | "archived";

export type SortOption = "newest" | "oldest" | "score" | "name";

export type AddIdeaMode = "create" | "random" | "anamnesis";

/** Состояние бесплатной выдачи из каталога для текущего пользователя. */
export type CatalogStatus = {
	/** Пользователь уже забрал бесплатную идею сегодня. */
	usedToday: boolean;
	/** Сколько невыданных идей осталось в общем пуле. */
	poolLeft: number;
};
