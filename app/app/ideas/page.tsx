import { IdeasPageClient } from "@/components/ideas/ideas-page-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Идеи — Ideapick",
	description:
		"Ваши бизнес-идеи и их AI-оценки: добавляйте новые, анализируйте и сравнивайте.",
};

export default function IdeasPage() {
	return <IdeasPageClient />;
}
