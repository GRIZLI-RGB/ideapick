import "server-only";

import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";

type SessionUser = NonNullable<
	Awaited<ReturnType<typeof auth.api.getSession>>
>["user"];

/**
 * Гард для страниц /admin: возвращает пользователя-админа либо 404.
 * 404 вместо редиректа — чтобы не раскрывать существование раздела.
 */
export async function requireAdmin(): Promise<SessionUser> {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user || session.user.role !== "admin") {
		notFound();
	}
	return session.user;
}

/** Гард для admin API-роутов: возвращает админа либо null. */
export async function getAdminUser(
	requestHeaders: Headers,
): Promise<SessionUser | null> {
	const session = await auth.api.getSession({ headers: requestHeaders });
	if (!session?.user || session.user.role !== "admin") {
		return null;
	}
	return session.user;
}
