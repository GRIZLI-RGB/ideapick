"use client";

import { AppShell } from "@/components/app/app-shell";
import { ConnectedAppHeader } from "@/components/app/app-header";
import {
	AddIdeaDialogs,
	DemoToast,
} from "@/components/ideas/add-idea-dialogs";
import { IdeasDemoProvider } from "@/components/ideas/ideas-demo-provider";
import { SupportProvider } from "@/components/support/support-provider";
import { WalletModal } from "@/components/wallet/wallet-modal";
import type { Idea } from "@/lib/ideas/types";
import type { SupportTicket } from "@/lib/support/types";
import type { Transaction } from "@/lib/wallet/types";

export function AppLayoutClient({
	children,
	initialBalance,
	initialTransactions,
	initialIdeas,
	initialTickets,
}: {
	children: React.ReactNode;
	initialBalance: number;
	initialTransactions: Transaction[];
	initialIdeas: Idea[];
	initialTickets: SupportTicket[];
}) {
	return (
		<IdeasDemoProvider
			initialBalance={initialBalance}
			initialTransactions={initialTransactions}
			initialIdeas={initialIdeas}
		>
			<SupportProvider initialTickets={initialTickets}>
			<AppShell>
				<ConnectedAppHeader />
				<main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
					{children}
				</main>
				<AddIdeaDialogs />
				<WalletModal />
				<DemoToast />
			</AppShell>
			</SupportProvider>
		</IdeasDemoProvider>
	);
}
