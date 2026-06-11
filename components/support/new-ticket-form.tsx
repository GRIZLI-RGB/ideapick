"use client";

import { useSupport } from "@/components/support/support-provider";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewTicketForm() {
	const router = useRouter();
	const { createTicket } = useSupport();
	const [subject, setSubject] = useState("");
	const [body, setBody] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!subject.trim() || !body.trim() || loading) return;
		setLoading(true);
		setError(null);
		try {
			const id = await createTicket(subject, body);
			router.push(`/app/support/${id}`);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Не удалось создать обращение",
			);
			setLoading(false);
		}
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.28 }}
			className="w-full space-y-6 pb-8"
		>
			<div className="flex items-center gap-3">
				<Link
					href="/app/support"
					className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-stone-700/80 text-stone-400 transition hover:border-stone-600 hover:bg-stone-800 hover:text-stone-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
					aria-label="Назад"
				>
					<ArrowLeft className="size-4" />
				</Link>
				<h1 className="text-2xl font-bold tracking-tight text-stone-50 sm:text-3xl">
					Новое обращение
				</h1>
			</div>

			<form
				onSubmit={handleSubmit}
				className="space-y-4 rounded-3xl border border-stone-800/50 bg-stone-900/30 p-5 sm:p-6"
			>
				<div>
					<label
						htmlFor="ticket-subject"
						className="text-sm font-medium text-stone-200"
					>
						Тема
					</label>
					<input
						id="ticket-subject"
						type="text"
						required
						maxLength={120}
						value={subject}
						onChange={(e) => setSubject(e.target.value)}
						placeholder="Кратко, о чём обращение"
						className="mt-2 w-full rounded-xl border border-stone-700 bg-stone-950/60 px-3 py-2.5 text-sm text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20"
					/>
				</div>
				<div>
					<label
						htmlFor="ticket-body"
						className="text-sm font-medium text-stone-200"
					>
						Сообщение
					</label>
					<textarea
						id="ticket-body"
						required
						rows={6}
						maxLength={4000}
						value={body}
						onChange={(e) => setBody(e.target.value)}
						placeholder="Подробности: что делали, что ожидали, что получилось"
						className="mt-2 w-full resize-y rounded-xl border border-stone-700 bg-stone-950/60 px-3 py-2.5 text-sm text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20"
					/>
				</div>
				{error ? (
					<p className="text-sm text-red-400" role="alert">
						{error}
					</p>
				) : null}
				<button
					type="submit"
					disabled={!subject.trim() || !body.trim() || loading}
					className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{loading ? (
						<Loader2 className="size-4 animate-spin" aria-hidden />
					) : (
						<Send className="size-4" aria-hidden />
					)}
					{loading ? "Создаём…" : "Отправить обращение"}
				</button>
			</form>
		</motion.div>
	);
}
