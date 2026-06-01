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
	subject: string;
	status: SupportTicketStatus;
	createdAt: string;
	updatedAt: string;
	messages: TicketMessage[];
};
