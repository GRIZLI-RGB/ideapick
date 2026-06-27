import { ImageResponse } from "next/og";
import { getPublishedArticle } from "@/lib/blog/service";

export const alt = "Статья блога Ideapick";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
	params,
}: {
	params: { slug: string };
}) {
	const article = await getPublishedArticle(params.slug);
	const title = article?.title ?? "Блог Ideapick";
	const category = article?.category ?? "Блог";

	return new ImageResponse(
		(
			<div
				style={{
					height: "100%",
					width: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					background:
						"linear-gradient(135deg, #1c1917 0%, #0c0a09 60%, #0c0a09 100%)",
					padding: "72px",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 16,
						fontSize: 30,
						fontWeight: 700,
						color: "#fafaf9",
					}}
				>
					<div
						style={{
							width: 44,
							height: 44,
							borderRadius: 12,
							background: "#f59e0b",
						}}
					/>
					Ideapick
				</div>

				<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
					<div
						style={{
							display: "flex",
							alignSelf: "flex-start",
							border: "1px solid rgba(245,158,11,0.4)",
							borderRadius: 999,
							color: "#fcd34d",
							fontSize: 24,
							padding: "8px 20px",
						}}
					>
						{category}
					</div>
					<div
						style={{
							fontSize: 64,
							fontWeight: 800,
							color: "#fafaf9",
							lineHeight: 1.1,
							letterSpacing: "-0.02em",
							maxWidth: 1000,
						}}
					>
						{title}
					</div>
				</div>

				<div style={{ fontSize: 26, color: "#a8a29e" }}>
					Оценка бизнес-идей с помощью AI · ideapick.ru
				</div>
			</div>
		),
		{ ...size },
	);
}
