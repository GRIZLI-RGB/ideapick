import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { YandexMetrika } from "@/components/site/yandex-metrika";
import "./globals.css";

import { TooltipProvider } from "@/components/ui/tooltip";

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
	appleWebApp: {
		title: "Ideapick",
		capable: true,
		statusBarStyle: "black-translucent",
	},
	icons: {
		icon: [
			{ url: "/favicon.ico", sizes: "any" },
			{ url: "/favicon.svg", type: "image/svg+xml" },
			{ url: "/icons/icon-32x32.png", type: "image/png", sizes: "32x32" },
			{ url: "/icons/icon-96x96.png", type: "image/png", sizes: "96x96" },
		],
		apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
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
				<TooltipProvider delayDuration={200}>
					{children}
					<YandexMetrika />
				</TooltipProvider>
			</body>
		</html>
	);
}
