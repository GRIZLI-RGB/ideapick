import { AppLayoutClient } from "@/components/app/app-layout-client";

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return <AppLayoutClient>{children}</AppLayoutClient>;
}
