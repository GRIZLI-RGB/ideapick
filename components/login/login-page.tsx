"use client";

import { LoginRightPanel } from "@/components/login/login-right-panel";
import type { AuthThemeOverlay, LoginAuthTheme } from "@/components/login/login-theme";
import { LOGIN_AUTH_THEME } from "@/components/login/login-theme";
import { GoogleIcon } from "@/components/login/google-icon";
import { MOCK_IDEAS } from "@/components/login/mock-data";
import { useMockAuth } from "@/components/login/use-mock-auth";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Mail, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

type Phase = "input" | "filled" | "analyzing" | "result";
const PHASES: Phase[] = ["input", "filled", "analyzing", "result"];
const PHASE_LABEL: Record<Phase, string> = {
	input: "1 · Генерируем идею",
	filled: "2 · Добавляем описание",
	analyzing: "3 · Запускаем анализ",
	result: "4 · Оценка и советы",
};

function ThemeOverlay({ overlay }: { overlay: AuthThemeOverlay }) {
	if (overlay.kind === "class") {
		return (
			<div
				className={`pointer-events-none absolute inset-0 z-0 ${overlay.className}`}
				aria-hidden
			/>
		);
	}
	return (
		<div
			className="pointer-events-none absolute inset-0 z-0"
			style={overlay.style}
			aria-hidden
		/>
	);
}

function AuthDemoPanel({
	theme,
	phase,
	phaseIdx,
	ideaIdx,
	idea,
}: {
	theme: LoginAuthTheme;
	phase: Phase;
	phaseIdx: number;
	ideaIdx: number;
	idea: (typeof MOCK_IDEAS)[number];
}) {
	const d = theme.demo;
	const a = theme.aside;

	return (
		<div className="relative mx-auto w-full max-w-md">
			<div className="mb-3 flex items-center justify-between text-xs">
				<span className={`font-medium ${a.label}`}>
					{PHASE_LABEL[phase]}
				</span>
				<div className="flex gap-1.5">
					{PHASES.map((_, i) => (
						<motion.span
							key={i}
							className="h-1 rounded-full"
							animate={{
								width: i === phaseIdx ? 24 : 6,
								backgroundColor:
									i <= phaseIdx
										? a.phaseActive
										: a.phaseInactive,
							}}
							transition={{ duration: 0.4 }}
						/>
					))}
				</div>
			</div>

			<div className={`overflow-hidden rounded-2xl ${d.card}`}>
				<AnimatePresence mode="wait">
					{phase === "input" && (
						<motion.div
							key={`in-${ideaIdx}`}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="space-y-3"
						>
							<div className={`h-3 w-32 rounded ${d.skeleton}`} />
							<div
								className={`h-9 rounded-lg border ${d.borderDashed}`}
							/>
							<div className={`h-3 w-24 rounded ${d.skeleton}`} />
							<div
								className={`h-20 rounded-lg border ${d.borderDashed}`}
							/>
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
								<label
									className={`text-[10px] font-medium uppercase tracking-wider ${d.label}`}
								>
									Название
								</label>
								<div
									className={`mt-1 flex items-center gap-2 rounded-lg border px-3 py-2 ${d.innerBg}`}
								>
									<Check className="size-3.5 shrink-0 text-emerald-500" />
									<p
										className={`truncate text-sm font-medium ${d.text}`}
									>
										{idea.title}
									</p>
								</div>
							</div>
							<div>
								<label
									className={`text-[10px] font-medium uppercase tracking-wider ${d.label}`}
								>
									Описание
								</label>
								<div className={`mt-1 rounded-lg border px-3 py-2 ${d.innerBg}`}>
									<p className={`text-xs leading-relaxed ${d.muted}`}>
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
							<div
								className={`flex items-center gap-2 text-sm font-medium ${d.loader}`}
							>
								<Loader2 className="size-4 animate-spin" />
								AI анализирует…
							</div>
							{[0, 1, 2].map((i) => (
								<motion.div
									key={i}
									className={`h-3 rounded ${d.skeleton}`}
									initial={{ width: "30%" }}
									animate={{ width: ["30%", "85%", "60%"] }}
									transition={{
										duration: 1.6,
										repeat: Infinity,
										delay: i * 0.15,
									}}
								/>
							))}
							<div className={`h-12 rounded-lg opacity-80 ${d.skeleton}`} />
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
							<p className={`text-sm font-semibold leading-snug ${d.text}`}>
								{idea.title}
							</p>
							<div className={`flex items-center gap-3 rounded-xl p-2.5 ${d.innerBg}`}>
								<div className="relative size-10">
									<svg
										viewBox="0 0 36 36"
										className="size-10 -rotate-90"
									>
										<circle
											cx="18"
											cy="18"
											r="15"
											className={d.scoreRing}
											strokeWidth="3"
											fill="none"
										/>
										<motion.circle
											cx="18"
											cy="18"
											r="15"
											className={d.scoreRingActive}
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
									<span
										className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${d.muted}`}
									>
										{idea.score}
									</span>
								</div>
								<div className={`text-xs ${d.muted}`}>
									<div className={`flex items-center gap-1 font-medium ${d.text}`}>
										<Sparkles className={`size-3 ${d.sparkles}`} />
										Анализ AI
									</div>
									<div>оценка · {idea.score}/100</div>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}

export function LoginPage() {
	const {
		email,
		setEmail,
		loading,
		sent,
		signInWithGoogle,
		sendMagicLink,
		resetMagicLink,
	} = useMockAuth();
	const theme = LOGIN_AUTH_THEME;
	const [phaseIdx, setPhaseIdx] = useState(0);
	const [ideaIdx, setIdeaIdx] = useState(0);
	const phase = PHASES[phaseIdx];
	const idea = MOCK_IDEAS[ideaIdx];

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
		await sendMagicLink(e);
	}

	return (
		<div className={`flex min-h-dvh flex-col lg:flex-row ${theme.shell}`}>
			<aside
				className={`relative hidden overflow-hidden lg:flex lg:min-h-dvh lg:w-[55%] lg:flex-col lg:justify-center ${theme.aside.base}`}
			>
				{theme.aside.overlays.map((overlay, i) => (
					<ThemeOverlay key={i} overlay={overlay} />
				))}

				<div className="relative z-10 w-full px-10 py-8 xl:px-12 xl:py-10">
					<AuthDemoPanel
							theme={theme}
							phase={phase}
							phaseIdx={phaseIdx}
							ideaIdx={ideaIdx}
							idea={idea}
						/>
				</div>
			</aside>

			<LoginRightPanel
				email={email}
				setEmail={setEmail}
				loading={loading}
				sent={sent}
				onGoogle={signInWithGoogle}
				onMagic={handleMagic}
				onResetMagic={resetMagicLink}
			/>
		</div>
	);
}
