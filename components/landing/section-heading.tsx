import { Reveal } from "@/components/landing/reveal";

type SectionHeadingProps = {
	eyebrow: string;
	title: React.ReactNode;
	description?: React.ReactNode;
	align?: "center" | "left";
};

export function SectionHeading({
	eyebrow,
	title,
	description,
	align = "center",
}: SectionHeadingProps) {
	const isCenter = align === "center";
	return (
		<Reveal
			className={isCenter ? "mx-auto max-w-2xl text-center" : "max-w-2xl text-left"}
		>
			<span className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/8 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-amber-300/85">
				{eyebrow}
			</span>
			<h2 className="mt-4 text-balance text-2xl font-bold tracking-tight text-stone-50 sm:text-3xl md:text-[2rem] md:leading-tight">
				{title}
			</h2>
			{description ? (
				<p
					className={`mt-3 text-pretty text-sm leading-relaxed text-stone-400 sm:text-base ${
						isCenter ? "mx-auto max-w-xl" : ""
					}`}
				>
					{description}
				</p>
			) : null}
		</Reveal>
	);
}
