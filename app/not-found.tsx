import type { Metadata } from "next";
import { NotFoundPage } from "@/components/not-found/not-found-page";

export const metadata: Metadata = {
	title: "Страница не найдена",
	robots: { index: false },
};

export default function NotFound() {
	return <NotFoundPage />;
}
