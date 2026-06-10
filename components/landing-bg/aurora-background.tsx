/**
 * Плавные «северные сияния» — крупные размытые пятна с медленным дрейфом.
 * will-change-transform выносит размытые слои на собственные композитные слои;
 * два малозаметных нижних орба скрыты на мобильных ради производительности.
 */
export function AuroraBackground() {
	return (
		<div className="absolute inset-0 overflow-hidden" aria-hidden>
			<div className="animate-aurora-drift absolute -left-[20%] top-[-10%] h-[70vh] w-[70vw] rounded-full bg-[radial-gradient(ellipse,rgb(245_158_11/0.32)_0%,transparent_68%)] blur-3xl will-change-transform" />
			<div
				className="animate-aurora-drift-reverse absolute -right-[15%] top-[5%] h-[55vh] w-[55vw] rounded-full bg-[radial-gradient(ellipse,rgb(251_191_36/0.08)_0%,transparent_70%)] blur-3xl will-change-transform"
				style={{ animationDelay: "-4s" }}
			/>
			<div
				className="animate-aurora-drift absolute bottom-[10%] left-[15%] hidden h-[45vh] w-[50vw] rounded-full bg-[radial-gradient(ellipse,rgb(168_85_247/0.08)_0%,transparent_72%)] blur-3xl will-change-transform sm:block"
				style={{ animationDelay: "-8s" }}
			/>
			<div
				className="animate-aurora-drift-reverse absolute bottom-[-5%] right-[20%] hidden h-[40vh] w-[45vw] rounded-full bg-[radial-gradient(ellipse,rgb(56_189_248/0.06)_0%,transparent_70%)] blur-3xl will-change-transform sm:block"
				style={{ animationDelay: "-2s" }}
			/>
		</div>
	);
}
