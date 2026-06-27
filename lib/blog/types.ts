/** Статус публикации статьи блога. */
export type ArticleStatus = "draft" | "published";

/** Карточка статьи для публичной ленты /blog. */
export type BlogListItem = {
	slug: string;
	title: string;
	excerpt: string;
	category: string | null;
	readingMinutes: number;
	publishedAt: string;
};

/** Полная опубликованная статья для /blog/[slug]. */
export type BlogArticle = {
	slug: string;
	title: string;
	excerpt: string;
	content: string;
	category: string | null;
	coverImage: string | null;
	seoTitle: string | null;
	seoDescription: string | null;
	readingMinutes: number;
	publishedAt: string;
	updatedAt: string;
};

/** Строка списка статей в админ-панели. */
export type AdminArticleRow = {
	id: string;
	slug: string;
	title: string;
	status: ArticleStatus;
	category: string | null;
	readingMinutes: number;
	publishedAt: string | null;
	updatedAt: string;
};

/** Полные данные статьи для редактора в админ-панели. */
export type AdminArticle = {
	id: string;
	slug: string;
	title: string;
	excerpt: string;
	content: string;
	category: string | null;
	coverImage: string | null;
	seoTitle: string | null;
	seoDescription: string | null;
	status: ArticleStatus;
	readingMinutes: number;
	publishedAt: string | null;
	createdAt: string;
	updatedAt: string;
};

/** Входные данные формы создания/редактирования статьи. */
export type ArticleInput = {
	slug: string;
	title: string;
	excerpt: string;
	content: string;
	category?: string | null;
	coverImage?: string | null;
	seoTitle?: string | null;
	seoDescription?: string | null;
	status: ArticleStatus;
};
