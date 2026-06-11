import { AppLayoutClient } from "@/components/app/app-layout-client";
import { auth } from "@/lib/auth/auth";
import { listIdeas } from "@/lib/ideas/service";
import { listTickets } from "@/lib/support/service";
import { getWalletState } from "@/lib/wallet/service";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	robots: { index: false, follow: false },
};

export default async function AppLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Защита на сервере (в дополнение к middleware) + получение userId для кошелька.
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) {
		redirect("/login");
	}

	const [wallet, ideas, tickets] = await Promise.all([
		getWalletState(session.user.id),
		listIdeas(session.user.id),
		listTickets(session.user.id),
	]);

	return (
		<AppLayoutClient
			initialBalance={wallet.balance}
			initialTransactions={wallet.transactions}
			initialIdeas={ideas}
			initialTickets={tickets}
		>
			{children}
		</AppLayoutClient>
	);
}
