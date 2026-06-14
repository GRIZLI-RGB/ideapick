import { LlmStatusBadge } from "@/components/admin/llm-status-badge";
import {
	formatDateTime,
	formatTokens,
	formatUsd,
} from "@/lib/admin/format";
import { getLlmRequestDetail } from "@/lib/admin/service";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
	params: Promise<{ id: string }>;
};

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section className="rounded-2xl border border-stone-800/60 bg-stone-900/30 p-5">
			<h2 className="mb-3 font-semibold text-stone-100">{title}</h2>
			{children}
		</section>
	);
}

function Field({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex flex-col gap-0.5">
			<dt className="text-xs text-stone-500">{label}</dt>
			<dd className="text-sm tabular-nums text-stone-200">{value}</dd>
		</div>
	);
}

function CodeBlock({ text }: { text: string }) {
	return (
		<pre className="max-h-96 overflow-auto whitespace-pre-wrap wrap-break-word rounded-xl border border-stone-800/60 bg-stone-950/60 p-4 text-xs leading-relaxed text-stone-300">
			{text || "—"}
		</pre>
	);
}

export default async function AdminLlmDetailPage({ params }: PageProps) {
	const { id } = await params;
	const detail = await getLlmRequestDetail(id);
	if (!detail) notFound();

	return (
		<div className="space-y-6">
			<Link
				href="/admin/llm"
				className="inline-flex w-fit items-center gap-1.5 rounded-lg px-1 py-1 text-sm text-stone-500 transition hover:text-stone-300"
			>
				<ArrowLeft className="size-4" />К списку
			</Link>

			<div className="rounded-2xl border border-stone-800/60 bg-stone-900/30 p-5">
				<div className="flex flex-wrap items-center gap-2">
					<h1 className="text-xl font-bold tracking-tight text-stone-50">
						{detail.model}
					</h1>
					<LlmStatusBadge status={detail.status} />
				</div>
				<dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
					<Field label="Стоимость" value={formatUsd(detail.costMicroUsd)} />
					<Field
						label="Токены (всего)"
						value={formatTokens(detail.totalTokens)}
					/>
					<Field
						label="Промпт / ответ"
						value={`${formatTokens(detail.promptTokens)} / ${formatTokens(
							detail.completionTokens,
						)}`}
					/>
					<Field
						label="Из кеша"
						value={formatTokens(detail.cachedTokens)}
					/>
					<Field
						label="Время"
						value={`${(detail.latencyMs / 1000).toFixed(1)} с`}
					/>
					<Field
						label="Пользователь"
						value={detail.userEmail ?? "—"}
					/>
					<Field
						label="Шаблон"
						value={detail.templateKey ?? "—"}
					/>
					<Field label="Дата" value={formatDateTime(detail.createdAt)} />
				</dl>
				{detail.ideaId ? (
					<p className="mt-3 text-xs text-stone-500">
						Идея: <span className="text-stone-400">{detail.ideaId}</span>
					</p>
				) : null}
			</div>

			{detail.errorText ? (
				<Section title="Ошибка">
					<p className="text-sm leading-relaxed text-rose-300">
						{detail.errorText}
					</p>
				</Section>
			) : null}

			<Section title="Системный промпт">
				<CodeBlock text={detail.systemPrompt} />
			</Section>

			<Section title="Запрос пользователя">
				<CodeBlock text={detail.userPrompt} />
			</Section>

			<Section title="Ответ нейросети">
				<CodeBlock text={detail.responseContent} />
			</Section>
		</div>
	);
}
