import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	// Оптимистичная проверка по cookie (без обращения к БД) — достаточно для
	// редиректа на edge. Полная валидация сессии происходит на сервере.
	const sessionCookie = getSessionCookie(request);

	if (!sessionCookie) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set(
			"callbackUrl",
			request.nextUrl.pathname + request.nextUrl.search,
		);
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/app/:path*"],
};
