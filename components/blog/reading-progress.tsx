"use client";

import { useEffect, useState } from "react";

/**
 * Тонкая полоса прогресса чтения вверху страницы статьи. Чисто декоративный
 * клиентский слой — на контент и индексацию не влияет.
 */
export function ReadingProgress() {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		let frame = 0;
		const update = () => {
			frame = 0;
			const scrollable =
				document.documentElement.scrollHeight - window.innerHeight;
			const value = scrollable > 0 ? window.scrollY / scrollable : 0;
			setProgress(Math.min(1, Math.max(0, value)));
		};
		const onScroll = () => {
			if (frame === 0) frame = requestAnimationFrame(update);
		};
		update();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
			if (frame) cancelAnimationFrame(frame);
		};
	}, []);

	return (
		<div
			className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent"
			aria-hidden
		>
			<div
				className="h-full origin-left bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 transition-[width] duration-150 ease-out"
				style={{ width: `${progress * 100}%` }}
			/>
		</div>
	);
}
