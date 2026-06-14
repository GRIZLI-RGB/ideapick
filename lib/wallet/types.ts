export type TransactionKind =
	| "welcome"
	| "topup"
	| "anamnesis"
	| "analysis"
	// Автовозврат за анализ, когда генерация упала после списания.
	| "refund"
	| "bonus"
	// Ручная корректировка баланса администратором (+/−).
	| "adjustment";

export type Transaction = {
	id: string;
	kind: TransactionKind;
	/** Положительное — зачисление, отрицательное — списание */
	amount: number;
	label: string;
	createdAt: string;
};
