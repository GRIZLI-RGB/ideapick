type MagicLinkEmailArgs = {
	email: string;
	url: string;
};

/**
 * Отправка письма со ссылкой для входа (magic link).
 *
 * Сейчас провайдер почты не подключён: в dev ссылка печатается в консоль
 * сервера (этого достаточно, чтобы войти локально). Точка интеграции
 * реального провайдера (Resend / SMTP) — ниже, в ветке production.
 */
export async function sendMagicLinkEmail({ email, url }: MagicLinkEmailArgs) {
	if (process.env.NODE_ENV !== "production") {
		console.info(`\n[magic-link] вход для ${email}:\n${url}\n`);
		return;
	}

	// TODO(email): подключить реального провайдера, например Resend:
	//   const { Resend } = await import("resend");
	//   await new Resend(process.env.RESEND_API_KEY).emails.send({
	//     from: process.env.EMAIL_FROM!,
	//     to: email,
	//     subject: "Вход в Ideapick",
	//     html: `<a href="${url}">Войти</a>`,
	//   });
	console.warn(
		`[magic-link] провайдер почты не настроен; ссылка для ${email}: ${url}`,
	);
}
