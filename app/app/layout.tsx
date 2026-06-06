import { AppLayoutClient } from "@/components/app/app-layout-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
	robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return <AppLayoutClient>{children}</AppLayoutClient>;
}
