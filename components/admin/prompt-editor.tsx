"use client";

import { DEEPSEEK_MODEL_IDS } from "@/lib/llm/prompts";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type PromptEditorData = {
	id: string;
	key: string;
	name: string;
	model: string;
	thinking: boolean;
	/** Температура ×100 (целое). */
	temperature: number;
	maxTokens: number;
	systemPrompt: string;
	userPromptTemplate: string;
	isActive: boolean;
	updatedAt: string;
};

const inputCls =
	"w-full rounded-xl border border-stone-700 bg-stone-950/60 px-3 py-2 text-sm text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20";

const labelCls = "block text-xs font-medium text-stone-400";

export function PromptEditor({ template }: { template: PromptEditorData }) {
	const router = useRouter();
	const [name, setName] = useState(template.name);
	const [model, setModel] = useState(template.model);
	const [thinking, setThinking] = useState(template.thinking);
	const [temperature, setTemperature] = useState(template.temperature / 100);
	const [maxTokens, setMaxTokens] = useState(template.maxTokens);
	const [systemPrompt, setSystemPrompt] = useState(template.systemPrompt);
	const [userPromptTemplate, setUserPromptTemplate] = useState(
		template.userPromptTemplate,
	);
	const [isActive, setIsActive] = useState(template.isActive);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setBusy(true);
		setError(null);
		setSuccess(null);
		try {
			const res = await fetch(`/api/admin/prompts/${template.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name,
					model,
					thinking,
					temperature: Math.round(temperature * 100),
					maxTokens,
					systemPrompt,
					userPromptTemplate,
					isActive,
				}),
			});
			const data = await res.json().catch(() => null);
			if (!res.ok) {
				throw new Error(
					data && typeof data.error === "string"
						? data.error
						: "Не удалось сохранить",
				);
			}
			setSuccess("Сохранено");
			router.refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Что-то пошло не так");
		} finally {
			setBusy(false);
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-4 rounded-2xl border border-stone-800/60 bg-stone-900/30 p-5"
		>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<h2 className="font-semibold text-stone-100">{template.name}</h2>
				<code className="rounded bg-stone-800 px-1.5 py-0.5 text-[11px] text-stone-400">
					{template.key}
				</code>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-1">
					<label className={labelCls} htmlFor={`name-${template.id}`}>
						Название
					</label>
					<input
						id={`name-${template.id}`}
						type="text"
						required
						maxLength={120}
						value={name}
						onChange={(e) => setName(e.target.value)}
						className={inputCls}
					/>
				</div>
				<div className="space-y-1">
					<label className={labelCls} htmlFor={`model-${template.id}`}>
						Модель
					</label>
					<select
						id={`model-${template.id}`}
						value={model}
						onChange={(e) => setModel(e.target.value)}
						className={inputCls}
					>
						{DEEPSEEK_MODEL_IDS.map((m) => (
							<option key={m} value={m}>
								{m}
							</option>
						))}
					</select>
				</div>
				<div className="space-y-1">
					<label className={labelCls} htmlFor={`temp-${template.id}`}>
						Температура (0–2.0)
					</label>
					<input
						id={`temp-${template.id}`}
						type="number"
						min={0}
						max={2}
						step={0.1}
						value={temperature}
						onChange={(e) => setTemperature(Number(e.target.value))}
						className={inputCls}
					/>
				</div>
				<div className="space-y-1">
					<label className={labelCls} htmlFor={`tokens-${template.id}`}>
						max_tokens
					</label>
					<input
						id={`tokens-${template.id}`}
						type="number"
						min={500}
						max={64000}
						step={100}
						value={maxTokens}
						onChange={(e) => setMaxTokens(Number(e.target.value))}
						className={inputCls}
					/>
				</div>
			</div>

			<div className="flex flex-wrap gap-5">
				<label className="flex cursor-pointer items-center gap-2 text-sm text-stone-300">
					<input
						type="checkbox"
						checked={thinking}
						onChange={(e) => setThinking(e.target.checked)}
						className="size-4 accent-amber-500"
					/>
					Режим рассуждений (thinking)
				</label>
				<label className="flex cursor-pointer items-center gap-2 text-sm text-stone-300">
					<input
						type="checkbox"
						checked={isActive}
						onChange={(e) => setIsActive(e.target.checked)}
						className="size-4 accent-amber-500"
					/>
					Активен
				</label>
			</div>

			<div className="space-y-1">
				<label className={labelCls} htmlFor={`system-${template.id}`}>
					Системный промпт
				</label>
				<textarea
					id={`system-${template.id}`}
					required
					rows={12}
					value={systemPrompt}
					onChange={(e) => setSystemPrompt(e.target.value)}
					className={`${inputCls} resize-y font-mono text-xs leading-relaxed`}
				/>
			</div>

			<div className="space-y-1">
				<label className={labelCls} htmlFor={`user-${template.id}`}>
					Промпт пользователя (плейсхолдеры {"{{title}}"} и{" "}
					{"{{description}}"})
				</label>
				<textarea
					id={`user-${template.id}`}
					required
					rows={4}
					value={userPromptTemplate}
					onChange={(e) => setUserPromptTemplate(e.target.value)}
					className={`${inputCls} resize-y font-mono text-xs leading-relaxed`}
				/>
			</div>

			<div className="flex flex-wrap items-center gap-3">
				<button
					type="submit"
					disabled={busy}
					className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
					Сохранить
				</button>
				{error ? (
					<span className="text-sm text-red-400" role="alert">
						{error}
					</span>
				) : null}
				{success ? (
					<span className="text-sm text-emerald-400">{success}</span>
				) : null}
			</div>
		</form>
	);
}
