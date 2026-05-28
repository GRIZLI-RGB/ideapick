"use client";

import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import { HEADER_SCALE } from "@/lib/app/header-scale";

export function LogoBrandLink() {
	return (
		<Link
			href="/app/ideas"
			className="flex shrink-0 items-center gap-2.5 rounded-lg outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-amber-500/40"
		>
			<BrandMark size={HEADER_SCALE.logo} />
			<span className="hidden text-sm font-semibold tracking-tight text-stone-100 sm:inline">
				Ideapick
			</span>
		</Link>
	);
}
