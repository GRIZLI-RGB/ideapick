export type TransactionKind = "topup" | "anamnesis" | "analysis" | "bonus";

export type Transaction = {
	id: string;
	kind: TransactionKind;
	/** Положительное — зачисление, отрицательное — списание */
	amount: number;
	label: string;
	createdAt: string;
};

export type DemoAccount = {
	email: string;
	provider: "google" | "email";
	memberSince: string;
};
