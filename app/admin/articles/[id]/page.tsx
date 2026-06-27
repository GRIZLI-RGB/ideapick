import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleEditor } from "@/components/admin/article-editor";
import { getArticleAdmin } from "@/lib/blog/service";

export const dynamic = "force-dynamic";

type PageProps = {
	params: Promise<{ id: string }>;
};

export default async function AdminArticleEditPage({ params }: PageProps) {
	const { id } = await params;
	const isNew = id === "new";

	const article = isNew ? undefined : await getArticleAdmin(id);
	if (!isNew && !article) notFound();

	return (
		<div className="space-y-5">
			<Link
				href="/admin/articles"
				className="inline-flex items-center gap-1.5 text-sm text-stone-400 transition hover:text-stone-200"
			>
				<ArrowLeft className="size-4" />
				К списку статей
			</Link>
			<h1 className="text-2xl font-bold tracking-tight text-stone-50">
				{isNew ? "Новая статья" : "Редактирование статьи"}
			</h1>
			<ArticleEditor article={article ?? undefined} />
		</div>
	);
}
