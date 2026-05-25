import { geist } from "@/lib/fonts";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
	return <div className={geist.variable}>{children}</div>;
}
