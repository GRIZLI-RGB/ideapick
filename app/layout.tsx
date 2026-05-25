import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Ideapick",
	description: "Ideapick",
	metadataBase: new URL("https://ideapick.ru"),
	openGraph: {
		title: "Ideapick",
		description: "Ideapick",
		siteName: "Ideapick",
		locale: "ru_RU",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Ideapick",
		description: "Ideapick",
	},
	icons: {
		other: [
			{
				rel: "mask-icon",
				url: "/icons/safari-pinned-tab.svg",
				color: "#000000",
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
		<html lang="ru">
			<body>{children}</body>
		</html>
	);
}
