import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
	subsets: ["latin", "cyrillic"],
	variable: "--font-geist",
});

export const metadata: Metadata = {
	title: "Ideapick",
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
