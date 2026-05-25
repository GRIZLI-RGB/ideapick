"use client";

import Link from "next/link";
import { GoogleIcon } from "@/components/login/google-icon";
import { MOCK_IDEAS, VERDICTS } from "@/components/login/mock-data";
import { useMockAuth } from "@/components/login/use-mock-auth";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Mail, Send, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

type Phase = "input" | "filled" | "analyzing" | "result";
const PHASES: Phase[] = ["input", "filled", "analyzing", "result"];
const PHASE_LABEL: Record<Phase, string> = {
	input: "1 · Создаём идею",
	filled: "2 · Описание готово",
	analyzing: "3 · Анализ AI",
	result: "4 · Вердикт",
};
const AUTH_DOT_GRID_STYLE = {
	backgroundImage:
		"radial-gradient(circle, rgb(161 161 170 / 0.14) 1.25px, transparent 1.25px)",
	backgroundSize: "20px 20px",
} satisfies React.CSSProperties;

export function LoginPage() {
	const { email, setEmail, loading, sent, signInWithGoogle, sendMagicLink, resetMagicLink } =
		useMockAuth();
	const [flying, setFlying] = useState(false);
	const [phaseIdx, setPhaseIdx] = useState(0);
	const [ideaIdx, setIdeaIdx] = useState(0);
	const phase = PHASES[phaseIdx];
	const idea = MOCK_IDEAS[ideaIdx];
	const verdict = VERDICTS[idea.verdict];

	useEffect(() => {
		const tick = setInterval(() => {
			setPhaseIdx((p) => {
				const next = (p + 1) % PHASES.length;
				if (next === 0) setIdeaIdx((i) => (i + 1) % MOCK_IDEAS.length);
				return next;
			});
		}, 2400);
		return () => clearInterval(tick);
	}, []);

	async function handleMagic(e: React.FormEvent) {
		e.preventDefault();
		if (!email.trim()) return;
		setFlying(true);
		await sendMagicLink(e);
		setTimeout(() => setFlying(false), 1300);
	}

	return (
		<div className="flex min-h-dvh">
			<aside className="relative hidden w-[55%] flex-col justify-center overflow-hidden bg-zinc-50 lg:flex">
				<div
					className="pointer-events-none absolute inset-0 z-0"
					style={AUTH_DOT_GRID_STYLE}
					aria-hidden
				/>

				<div className="relative z-10 flex min-h-full w-full flex-col justify-center p-12">
					<div className="absolute left-12 top-12">
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
							Ideapick
						</p>
						<h2 className="mt-3 max-w-md text-balance text-2xl font-semibold leading-snug tracking-tight text-zinc-900">
							От идеи к вердикту, без лишнего шума.
						</h2>
					</div>

					<div className="relative mx-auto w-full max-w-md">
					<div className="mb-4 flex items-center justify-between text-xs">
						<span className="font-medium text-zinc-700">{PHASE_LABEL[phase]}</span>
						<div className="flex gap-1.5">
							{PHASES.map((_, i) => (
								<motion.span
									key={i}
									className="h-1 rounded-full"
									animate={{
										width: i === phaseIdx ? 24 : 6,
										backgroundColor: i <= phaseIdx ? "#18181b" : "#e4e4e7",
									}}
									transition={{ duration: 0.4 }}
								/>
							))}
						</div>
					</div>

					<motion.div
						layout
						className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-lg shadow-zinc-300/30 ring-1 ring-zinc-900/5"
					>
						<AnimatePresence mode="wait">
							{phase === "input" && (
								<motion.div
									key={`in-${ideaIdx}`}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									className="space-y-3"
								>
									<div className="h-3 w-32 rounded bg-zinc-100" />
									<div className="h-9 rounded-lg border border-dashed border-zinc-200" />
									<div className="h-3 w-24 rounded bg-zinc-100" />
									<div className="h-20 rounded-lg border border-dashed border-zinc-200" />
								</motion.div>
							)}

							{phase === "filled" && (
								<motion.div
									key={`fl-${ideaIdx}`}
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -4 }}
									className="space-y-2.5"
								>
									<div>
										<label className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
											Название
										</label>
										<div className="mt-1 flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50/60 px-3 py-2">
											<Check className="size-3.5 shrink-0 text-emerald-500" />
											<p className="truncate text-sm font-medium text-zinc-900">
												{idea.title}
											</p>
										</div>
									</div>
									<div>
										<label className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
											Описание
										</label>
										<div className="mt-1 rounded-lg border border-zinc-200 bg-zinc-50/60 px-3 py-2">
											<p className="text-xs leading-relaxed text-zinc-700">
												{idea.desc}
											</p>
										</div>
									</div>
								</motion.div>
							)}

							{phase === "analyzing" && (
								<motion.div
									key="an"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									className="space-y-3"
								>
									<div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
										<Loader2 className="size-4 animate-spin" />
										AI анализирует…
									</div>
									{[0, 1, 2].map((i) => (
										<motion.div
											key={i}
											className="h-3 rounded bg-zinc-100"
											initial={{ width: "30%" }}
											animate={{ width: ["30%", "85%", "60%"] }}
											transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.15 }}
										/>
									))}
									<div className="h-12 rounded-lg bg-zinc-100/80" />
								</motion.div>
							)}

							{phase === "result" && (
								<motion.div
									key={`re-${ideaIdx}`}
									initial={{ opacity: 0, scale: 0.96 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0 }}
									className="space-y-3"
								>
									<div className="flex items-start justify-between gap-3">
										<p className="text-sm font-semibold text-zinc-900">{idea.title}</p>
										<span
											className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${verdict.bg} ${verdict.color}`}
										>
											{verdict.short}
										</span>
									</div>
									<div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3">
										<div className="relative size-10">
											<svg viewBox="0 0 36 36" className="size-10 -rotate-90">
												<circle
													cx="18"
													cy="18"
													r="15"
													className="stroke-zinc-200"
													strokeWidth="3"
													fill="none"
												/>
												<motion.circle
													cx="18"
													cy="18"
													r="15"
													className="stroke-zinc-900"
													strokeWidth="3"
													fill="none"
													strokeLinecap="round"
													initial={{ strokeDasharray: "0 94" }}
													animate={{
														strokeDasharray: `${(idea.score / 100) * 94} 94`,
													}}
													transition={{ duration: 1, ease: "easeOut" }}
												/>
											</svg>
											<span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-zinc-700">
												{idea.score}
											</span>
										</div>
										<div className="text-xs text-zinc-600">
											<div className="flex items-center gap-1 font-medium text-zinc-900">
												<Sparkles className="size-3 text-zinc-400" />
												Анализ AI
											</div>
											<div>уверенность · {idea.score}/100</div>
										</div>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</motion.div>
					</div>
				</div>
			</aside>

			<main className="relative flex flex-1 items-center justify-center overflow-hidden bg-white px-6 py-16">
				<AnimatePresence>
					{flying && (
						<motion.div
							key="plane"
							initial={{ x: "10%", y: 0, opacity: 0, rotate: -10 }}
							animate={{ x: "120%", y: -160, opacity: [0, 1, 1, 0], rotate: 14 }}
							transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
							className="pointer-events-none absolute left-0 top-[55%] z-30"
						>
							<Send className="size-6 text-zinc-700" />
						</motion.div>
					)}
				</AnimatePresence>

				<div className="w-full max-w-[380px]">
					<div className="space-y-3">
						<button
							type="button"
							onClick={signInWithGoogle}
							disabled={loading !== null}
							className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{loading === "google" ? (
								<Loader2 className="size-5 animate-spin text-zinc-400" />
							) : (
								<GoogleIcon className="size-5" />
							)}
							Продолжить с Google
						</button>

						<div className="flex items-center gap-3 py-1">
							<div className="h-px flex-1 bg-zinc-200" />
							<span className="text-xs text-zinc-400">или</span>
							<div className="h-px flex-1 bg-zinc-200" />
						</div>

						{sent ? (
							<motion.div
								initial={{ scale: 0.96, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center text-sm"
							>
								<p className="font-medium text-zinc-900">Ссылка отправлена</p>
								<p className="mt-1 text-zinc-500">
									Проверьте <strong className="text-zinc-900">{email}</strong>
								</p>
								<button
									type="button"
									onClick={resetMagicLink}
									className="mt-3 cursor-pointer text-xs font-medium text-zinc-600 underline transition hover:text-zinc-900"
								>
									Изменить email
								</button>
							</motion.div>
						) : (
							<form onSubmit={handleMagic} className="space-y-3">
								<div className="relative">
									<Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
									<input
										type="email"
										required
										placeholder="you@example.com"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="w-full rounded-xl border border-zinc-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5"
									/>
								</div>
								<motion.button
									type="submit"
									whileTap={{ scale: 0.98 }}
									disabled={loading !== null}
									className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{loading === "magic" ? (
										<Loader2 className="size-4 animate-spin" />
									) : null}
									Отправить ссылку
								</motion.button>
							</form>
						)}
					</div>

					<p className="mt-5 text-center text-xs text-zinc-400">
						Продолжая, вы соглашаетесь с{" "}
						<Link
							href="/terms"
							className="text-zinc-600 underline decoration-zinc-300 underline-offset-2 transition hover:text-zinc-900 hover:decoration-zinc-500"
						>
							условиями
						</Link>{" "}
						и{" "}
						<Link
							href="/privacy"
							className="text-zinc-600 underline decoration-zinc-300 underline-offset-2 transition hover:text-zinc-900 hover:decoration-zinc-500"
						>
							политикой&nbsp;конфиденциальности
						</Link>
					</p>
				</div>
			</main>
		</div>
	);
}
