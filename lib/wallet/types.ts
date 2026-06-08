export type TransactionKind =
	| "welcome"
	| "topup"
	| "anamnesis"
	| "analysis"
	| "bonus";

export type Transaction = {
	id: string;
	kind: TransactionKind;
	/** Положительное — зачисление, отрицательное — списание */
	amount: number;
	label: string;
	createdAt: string;
};
