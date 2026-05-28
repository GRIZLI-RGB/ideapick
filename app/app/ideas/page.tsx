import { IdeasPageClient } from "@/components/ideas/ideas-page-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Идеи — Ideapick",
};

type PageProps = {
	searchParams: Promise<{ empty?: string }>;
};

export default async function IdeasPage({ searchParams }: PageProps) {
	const { empty } = await searchParams;
	return <IdeasPageClient startEmpty={empty === "1"} />;
}
