import { SITE_PAGE_AMBIENT_LAYERS, SITE_SHELL_CLASS } from "@/lib/site-theme";

type SitePageBackdropProps = {
	children: React.ReactNode;
	className?: string;
};

/** Оболочка длинной страницы с ровным ambient-фоном */
export function SitePageBackdrop({ children, className }: SitePageBackdropProps) {
	return (
		<div className={`relative ${SITE_SHELL_CLASS} ${className ?? ""}`}>
			{SITE_PAGE_AMBIENT_LAYERS.map((layer) => (
				<div
					key={layer}
					className={`pointer-events-none fixed inset-0 -z-10 ${layer}`}
					aria-hidden
				/>
			))}
			{children}
		</div>
	);
}
