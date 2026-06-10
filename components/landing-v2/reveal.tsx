"use client";

import {
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
	type ReactNode,
	type CSSProperties,
} from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void) {
	const mq = window.matchMedia(REDUCED_MOTION_QUERY);
	mq.addEventListener("change", callback);
	return () => mq.removeEventListener("change", callback);
}

function useReducedMotion() {
	return useSyncExternalStore(
		subscribeReducedMotion,
		() => window.matchMedia(REDUCED_MOTION_QUERY).matches,
		() => false,
	);
}

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
	const reduced = useReducedMotion();

	useEffect(() => {
		if (reduced) return;
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
	}, [reduced]);

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
