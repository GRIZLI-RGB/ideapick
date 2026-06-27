import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Рендер Markdown в типографику сайта (без @tailwindcss/typography — стили
// заданы вручную по элементам). Сырой HTML в Markdown не исполняется.
const components: Components = {
	h2: ({ children }) => (
		<h2 className="mt-12 scroll-mt-24 text-balance text-xl font-bold tracking-tight text-stone-50 sm:text-2xl">
			{children}
		</h2>
	),
	h3: ({ children }) => (
		<h3 className="mt-8 text-balance text-lg font-semibold text-stone-100">
			{children}
		</h3>
	),
	h4: ({ children }) => (
		<h4 className="mt-6 font-semibold text-stone-100">{children}</h4>
	),
	p: ({ children }) => (
		<p className="mt-4 text-pretty leading-relaxed text-stone-300">{children}</p>
	),
	a: ({ href, children }) => {
		const target = href ?? "#";
		const isInternal = target.startsWith("/") || target.startsWith("#");
		if (isInternal) {
			return (
				<Link
					href={target}
					className="font-medium text-amber-400 underline decoration-amber-500/40 underline-offset-2 transition hover:decoration-amber-400"
				>
					{children}
				</Link>
			);
		}
		return (
			<a
				href={target}
				target="_blank"
				rel="noopener noreferrer"
				className="font-medium text-amber-400 underline decoration-amber-500/40 underline-offset-2 transition hover:decoration-amber-400"
			>
				{children}
			</a>
		);
	},
	ul: ({ children }) => (
		<ul className="mt-4 space-y-2 pl-1 text-stone-300">{children}</ul>
	),
	ol: ({ children }) => (
		<ol className="mt-4 list-decimal space-y-2 pl-5 text-stone-300 marker:text-stone-500">
			{children}
		</ol>
	),
	li: ({ children }) => (
		<li className="leading-relaxed [ul>&]:relative [ul>&]:pl-5 [ul>&]:before:absolute [ul>&]:before:left-0 [ul>&]:before:top-[0.65em] [ul>&]:before:size-1.5 [ul>&]:before:-translate-y-1/2 [ul>&]:before:rounded-full [ul>&]:before:bg-amber-500/70">
			{children}
		</li>
	),
	strong: ({ children }) => (
		<strong className="font-semibold text-stone-100">{children}</strong>
	),
	em: ({ children }) => <em className="italic text-stone-200">{children}</em>,
	blockquote: ({ children }) => (
		<blockquote className="mt-6 border-l-2 border-amber-500/50 bg-stone-900/40 py-1 pl-4 text-stone-300 italic">
			{children}
		</blockquote>
	),
	code: ({ children }) => (
		<code className="rounded bg-stone-800 px-1.5 py-0.5 font-mono text-[0.85em] text-amber-200">
			{children}
		</code>
	),
	pre: ({ children }) => (
		<pre className="mt-4 overflow-x-auto rounded-xl border border-stone-800 bg-stone-950/70 p-4 text-sm text-stone-200">
			{children}
		</pre>
	),
	hr: () => <hr className="my-10 border-stone-800" />,
	table: ({ children }) => (
		<div className="mt-6 overflow-x-auto rounded-xl border border-stone-800/60">
			<table className="w-full text-left text-sm">{children}</table>
		</div>
	),
	thead: ({ children }) => (
		<thead className="border-b border-stone-800/60 text-xs uppercase tracking-wide text-stone-500">
			{children}
		</thead>
	),
	th: ({ children }) => <th className="px-4 py-2.5 font-medium">{children}</th>,
	td: ({ children }) => (
		<td className="border-b border-stone-800/40 px-4 py-2.5 text-stone-300">
			{children}
		</td>
	),
};

export function ArticleMarkdown({ content }: { content: string }) {
	return (
		<div className="mt-2">
			<ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
				{content}
			</ReactMarkdown>
		</div>
	);
}
