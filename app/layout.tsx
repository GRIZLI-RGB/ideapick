import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
	subsets: ["latin", "cyrillic"],
	variable: "--font-geist",
});

const APP_DESCRIPTION =
	"Оцените бизнес-идею с помощью AI-анализа — узнайте спрос, конкуренцию и монетизацию до того, как вложите ресурсы.";

export const metadata: Metadata = {
	title: "Ideapick",
	description: APP_DESCRIPTION,
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_APP_URL ?? "https://ideapick.ru",
	),
	openGraph: {
		title: "Ideapick",
		description: APP_DESCRIPTION,
		siteName: "Ideapick",
		locale: "ru_RU",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Ideapick",
		description: APP_DESCRIPTION,
	},
	icons: {
		other: [
			{
				rel: "mask-icon",
				url: "/icons/safari-pinned-tab.svg",
				color: "#f59e0b",
			},
		],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ru" className={`${geist.variable} scroll-smooth`}>
			<body
				className={`${geist.className} min-h-dvh bg-stone-950 text-stone-100 antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
