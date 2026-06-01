"use client";

import { HeaderActions } from "@/components/app/header-actions";
import { AppNav } from "@/components/app/app-nav";
import { LogoBrandLink } from "@/components/app/logo-brand-link";
import { HEADER_SCALE } from "@/lib/app/header-scale";
import { MOCK_BALANCE } from "@/lib/ideas/mock-data";
import { useIdeasDemo } from "@/components/ideas/ideas-demo-provider";

type AppHeaderProps = {
	balance?: number;
};

export function AppHeader({ balance = MOCK_BALANCE }: AppHeaderProps) {
	return (
		<header className="sticky top-0 z-40 border-b border-stone-800/80 bg-stone-950/80 backdrop-blur-md">
			<div
				className={`mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 sm:px-6 ${HEADER_SCALE.height}`}
			>
				<LogoBrandLink />
				<AppNav />
				<HeaderActions balance={balance} />
			</div>
		</header>
	);
}

export function ConnectedAppHeader() {
	const { balance } = useIdeasDemo();
	return <AppHeader balance={balance} />;
}
