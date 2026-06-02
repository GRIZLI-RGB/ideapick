/** Цвет кольца и цифры по диапазону score (диапазоны — черновик, подгоним позже). */
export function scoreStyles(score: number): { ring: string; text: string } {
	if (score >= 71) {
		return { ring: "stroke-emerald-400", text: "text-emerald-400" };
	}
	if (score >= 51) {
		return { ring: "stroke-amber-400", text: "text-amber-400" };
	}
	if (score >= 31) {
		return { ring: "stroke-sky-400", text: "text-sky-400" };
	}
	return { ring: "stroke-rose-400", text: "text-rose-400" };
}
