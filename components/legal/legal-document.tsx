export type LegalSection = {
	id: string;
	title: string;
	content: React.ReactNode;
};

type LegalDocumentProps = {
	sections: LegalSection[];
};

export function LegalDocument({ sections }: LegalDocumentProps) {
	return (
		<div className="space-y-8">
			<nav
				className="rounded-xl border border-stone-700/80 bg-stone-900/80 p-4 ring-1 ring-amber-500/10 sm:p-5"
				aria-label="Содержание"
			>
				<p className="text-xs font-medium uppercase tracking-wide text-stone-500">
					Содержание
				</p>
				<ol className="mt-2.5 space-y-1.5">
					{sections.map((section, index) => (
						<li key={section.id}>
							<a
								href={`#${section.id}`}
								className="text-sm leading-snug text-stone-400 underline decoration-stone-600 underline-offset-2 transition hover:text-stone-200 hover:decoration-stone-400"
							>
								{index + 1}. {section.title}
							</a>
						</li>
					))}
				</ol>
			</nav>

			<article className="space-y-10">
				{sections.map((section, index) => (
					<section
						key={section.id}
						id={section.id}
						className="scroll-mt-20"
					>
						<h2 className="text-lg font-semibold tracking-tight text-stone-50">
							<span className="mr-1.5 text-stone-500">{index + 1}.</span>
							{section.title}
						</h2>
						<div className="prose-legal mt-3">{section.content}</div>
					</section>
				))}
			</article>
		</div>
	);
}
