import { SupportInbox } from "@/components/support/support-inbox";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Поддержка — Ideapick",
};

export default function SupportPage() {
	return <SupportInbox />;
}
