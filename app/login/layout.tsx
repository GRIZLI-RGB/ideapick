import { Geist } from "next/font/google";

const geist = Geist({
	subsets: ["latin", "cyrillic"],
	variable: "--font-geist",
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className={`${geist.variable} ${geist.className} min-h-dvh antialiased`}>
			{children}
		</div>
	);
}
