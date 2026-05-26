import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
	subsets: ["latin", "cyrillic"],
	variable: "--font-geist",
});

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
		<html lang="ru" className={geist.variable}>
			<body className={`${geist.className} min-h-dvh antialiased`}>{children}</body>
		</html>
	);
}
