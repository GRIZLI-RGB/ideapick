"use client";

import { AppShell } from "@/components/app/app-shell";
import { ConnectedAppHeader } from "@/components/app/app-header";
import {
	AddIdeaDialogs,
	DemoToast,
} from "@/components/ideas/add-idea-dialogs";
import { IdeasDemoProvider } from "@/components/ideas/ideas-demo-provider";

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
	return (
		<IdeasDemoProvider>
			<AppShell>
				<ConnectedAppHeader />
				<main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
					{children}
				</main>
				<AddIdeaDialogs />
				<DemoToast />
			</AppShell>
		</IdeasDemoProvider>
	);
}
