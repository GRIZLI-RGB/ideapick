"use client";

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";

type RevealProps = {
	children: ReactNode;
	className?: string;
	/** Задержка в секундах */
	delay?: number;
	/** Начальный сдвиг по Y, px */
	y?: number;
};

/**
 * Fade-up при попадании во вьюпорт.
 * Уважает prefers-reduced-motion: контент показывается сразу, без анимации.
 */
export function Reveal({ children, className, delay = 0, y = 18 }: RevealProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);
	const [reduced, setReduced] = useState(false);

	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setReduced(true);
			setVisible(true);
			return;
		}
		const el = ref.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true);
					observer.disconnect();
				}
			},
			{ rootMargin: "-72px 0px", threshold: 0.05 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const style: CSSProperties = reduced
		? {}
		: {
				opacity: visible ? 1 : 0,
				transform: visible ? "translateY(0)" : `translateY(${y}px)`,
				transition: `opacity 0.65s cubic-bezier(0.21,0.47,0.32,0.98) ${delay}s, transform 0.65s cubic-bezier(0.21,0.47,0.32,0.98) ${delay}s`,
			};

	return (
		<div ref={ref} className={className} style={style}>
			{children}
		</div>
	);
}
