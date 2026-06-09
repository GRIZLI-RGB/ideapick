import { AuroraBackground } from "@/components/landing-bg/aurora-background";
import { SharedBgLayers } from "@/components/landing-bg/shared-layers";

export function LandingShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="relative min-h-dvh text-stone-100">
			<div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
				<div className="relative size-full">
					<SharedBgLayers />
					<AuroraBackground />
				</div>
			</div>
			<div className="relative z-10 overflow-x-clip">{children}</div>
		</div>
	);
}
