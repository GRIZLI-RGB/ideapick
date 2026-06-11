export type SupportTicketStatus = "open" | "in_progress" | "answered" | "closed";

export type TicketAuthor = "user" | "support";

export type TicketMessage = {
	id: string;
	author: TicketAuthor;
	body: string;
	createdAt: string;
};

export type SupportTicket = {
	id: string;
	/** Короткий номер для отображения («#1042») */
	number: number;
	subject: string;
	status: SupportTicketStatus;
	createdAt: string;
	updatedAt: string;
	messages: TicketMessage[];
};

/** Тикет с данными автора — для админ-панели */
export type AdminSupportTicket = SupportTicket & {
	user: {
		id: string;
		name: string;
		email: string;
	};
};
