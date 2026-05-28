"use client";

import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import { GoogleIcon } from "@/components/login/google-icon";
import type { LoginPanelBackground } from "@/components/login/login-panel-backgrounds";
import { LOGIN_PANEL_DEFAULT } from "@/components/login/login-panel-backgrounds";
import { LOGIN_AUTH_THEME } from "@/components/login/login-theme";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Mail } from "lucide-react";

const LOGO_SIZE = 48;

type LoginRightPanelProps = {
	panel?: LoginPanelBackground;
	email: string;
	setEmail: (v: string) => void;
	loading: "google" | "magic" | null;
	sent: boolean;
	onGoogle: () => void;
	onMagic: (e: React.FormEvent) => void;
	onResetMagic: () => void;
};

export function LoginRightPanel({
	panel = LOGIN_PANEL_DEFAULT,
	email,
	setEmail,
	loading,
	sent,
	onGoogle,
	onMagic,
	onResetMagic,
}: LoginRightPanelProps) {
	const m = LOGIN_AUTH_THEME.main;

	return (
		<main
			className={`relative flex flex-1 items-center justify-center px-6 py-12 ${panel.base}`}
		>
			{panel.layers.map((layer, i) => (
				<div
					key={i}
					className={`pointer-events-none absolute inset-0 z-0 ${layer}`}
					aria-hidden
				/>
			))}

			<div className="relative z-10 w-full max-w-[400px]">
				<header className="mb-7 text-center">
					<div className="flex justify-center">
						<BrandMark size={LOGO_SIZE} />
					</div>
					<h1 className="mt-3 text-balance text-2xl font-bold leading-snug tracking-tight text-stone-50">
						Проверьте идею до того, как вложите в неё ресурсы
					</h1>
				</header>

				<div className="space-y-3">
					<button
						type="button"
						onClick={onGoogle}
						disabled={loading !== null}
						className={`flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${m.googleBtn}`}
					>
						{loading === "google" ? (
							<Loader2 className={`size-5 animate-spin ${m.muted}`} />
						) : (
							<GoogleIcon className="size-5" />
						)}
						Продолжить с Google
					</button>

					<div className="flex items-center gap-3 py-1">
						<div className={`h-px flex-1 ${m.divider}`} />
						<span className={`text-xs ${m.dividerText}`}>или</span>
						<div className={`h-px flex-1 ${m.divider}`} />
					</div>

					<AnimatePresence mode="wait" initial={false}>
						{sent ? (
							<motion.div
								key="sent"
								initial={{ opacity: 0, y: 6 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -4 }}
								transition={{ duration: 0.22 }}
								className="space-y-3"
							>
								<div className={`rounded-xl p-4 ${m.sentCard}`}>
									<div className="flex gap-3">
										<div
											className={`flex size-10 shrink-0 items-center justify-center rounded-full ${m.sentIcon}`}
										>
											<Check
												className="size-5 text-emerald-400"
												strokeWidth={2.5}
											/>
										</div>
										<div className="min-w-0 pt-0.5">
											<p className="text-sm font-semibold text-stone-50">
												Письмо отправлено
											</p>
											<p className={`mt-1 text-xs leading-relaxed ${m.body}`}>
												Откройте ссылку в письме, чтобы войти. Если письма
												нет — проверьте «Спам».
											</p>
										</div>
									</div>
								</div>

								<div className="relative">
									<Mail
										className={`pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 ${m.muted}`}
									/>
									<div
										className={`w-full truncate rounded-xl border py-3 pl-10 pr-4 text-sm ${m.input}`}
										title={email}
									>
										{email}
									</div>
								</div>

								<button
									type="button"
									onClick={onResetMagic}
									className={`flex w-full cursor-pointer items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium transition ${m.secondaryBtn}`}
								>
									Изменить email
								</button>
							</motion.div>
						) : (
							<motion.form
								key="form"
								onSubmit={onMagic}
								initial={{ opacity: 0, y: 6 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -4 }}
								transition={{ duration: 0.22 }}
								className="space-y-3"
							>
								<div className="relative">
									<Mail
										className={`pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 ${m.muted}`}
									/>
									<input
										type="email"
										required
										placeholder="you@example.com"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className={`w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition focus:ring-2 ${m.input}`}
									/>
								</div>
								<motion.button
									type="submit"
									whileTap={{ scale: 0.98 }}
									disabled={loading !== null}
									className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${m.cta}`}
								>
									{loading === "magic" ? (
										<Loader2 className="size-4 animate-spin" />
									) : null}
									Получить ссылку для входа
								</motion.button>
							</motion.form>
						)}
					</AnimatePresence>
				</div>

				<p className={`mt-4 text-center text-xs ${m.muted}`}>
					Продолжая, вы соглашаетесь с{" "}
					<Link
						href="/terms"
						target="_blank"
						rel="noopener noreferrer"
						className={`underline underline-offset-2 transition ${m.link}`}
					>
						условиями
					</Link>{" "}
					и{" "}
					<Link
						href="/privacy"
						target="_blank"
						rel="noopener noreferrer"
						className={`underline underline-offset-2 transition ${m.link}`}
					>
						политикой&nbsp;конфиденциальности
					</Link>
				</p>
			</div>
		</main>
	);
}
