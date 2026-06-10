"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BrandMark } from "@/components/brand/brand-mark";
import { ArrowRight, Menu, X } from "lucide-react";

const NAV_LINKS = [
	{ href: "#how",     label: "Как это работает" },
	{ href: "#example", label: "Пример отчёта" },
	{ href: "#pricing", label: "Цены" },
	{ href: "#faq",     label: "Вопросы" },
];

export function LandingNav() {
	const [scrolled, setScrolled] = useState(false);
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLElement>(null);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 8);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	// Закрытие мобильного меню по Escape и клику вне
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		const onPointer = (e: PointerEvent) => {
			if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		window.addEventListener("keydown", onKey);
		window.addEventListener("pointerdown", onPointer);
		return () => {
			window.removeEventListener("keydown", onKey);
			window.removeEventListener("pointerdown", onPointer);
		};
	}, [open]);

	return (
		<header ref={rootRef} className="fixed inset-x-0 top-0 z-50">
			<div
				className={`transition-all duration-300 ${
					scrolled
						? "border-b border-stone-800/70 bg-stone-950/80 backdrop-blur-xl"
						: "border-b border-transparent"
				}`}
			>
				<nav className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between px-5 sm:px-6">
					<Link
						href="/"
						className="flex shrink-0 items-center gap-2.5 rounded-lg outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-amber-500/40"
					>
						<BrandMark size={30} />
						<span className="text-[0.9375rem] font-semibold tracking-tight text-stone-100">
							Ideapick
						</span>
					</Link>

					<div className="hidden items-center gap-1 md:flex">
						{NAV_LINKS.map((link) => (
							<a
								key={link.href}
								href={link.href}
								className="rounded-lg px-3 py-2 text-sm font-medium text-stone-400 transition hover:text-stone-100"
							>
								{link.label}
							</a>
						))}
					</div>

					<div className="flex items-center gap-2">
						<Link
							href="/login"
							className="hidden rounded-xl px-3.5 py-2 text-sm font-medium text-stone-300 transition hover:text-stone-100 sm:inline-flex"
						>
							Войти
						</Link>
						<Link
							href="/login"
							className="group hidden items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-stone-950 shadow-md shadow-amber-500/20 transition hover:bg-amber-400 sm:inline-flex"
						>
							Проверить идею
							<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
						</Link>
						<button
							type="button"
							onClick={() => setOpen((v) => !v)}
							aria-label={open ? "Закрыть меню" : "Открыть меню"}
							aria-expanded={open}
							className="inline-flex size-9 items-center justify-center rounded-lg border border-stone-800 bg-stone-900/60 text-stone-200 transition hover:bg-stone-800 md:hidden"
						>
							{open ? (
								<X className="size-5" />
							) : (
								<Menu className="size-5" />
							)}
						</button>
					</div>
				</nav>
			</div>

			{/* Мобильное меню */}
			<div
				className="mx-4 mt-2 overflow-hidden rounded-2xl border border-stone-800 bg-stone-950/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl transition-all duration-200 md:hidden"
				style={{
					maxHeight: open ? "400px" : "0px",
					opacity:   open ? 1 : 0,
					pointerEvents: open ? "auto" : "none",
					border:    open ? undefined : "none",
					padding:   open ? undefined : "0",
				}}
			>
				{NAV_LINKS.map((link) => (
					<a
						key={link.href}
						href={link.href}
						onClick={() => setOpen(false)}
						className="block rounded-xl px-4 py-3 text-sm font-medium text-stone-300 transition hover:bg-stone-900 hover:text-stone-100"
					>
						{link.label}
					</a>
				))}
				<Link
					href="/login"
					onClick={() => setOpen(false)}
					className="mt-1 flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-400"
				>
					Проверить идею бесплатно
					<ArrowRight className="size-4" />
				</Link>
			</div>
		</header>
	);
}
