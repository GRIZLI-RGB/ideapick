"use client";

import { SitePageBackdrop } from "@/components/site/site-page-backdrop";

type AppShellProps = {
	children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
	return (
		<SitePageBackdrop className="flex min-h-dvh flex-col">
			{children}
		</SitePageBackdrop>
	);
}
