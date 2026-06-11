import "server-only";

type MagicLinkEmailArgs = {
	email: string;
	url: string;
};

/**
 * Шаблон в стиле продукта: тёмная stone-палитра, янтарный акцент,
 * скруглённая карточка с тонкой рамкой (как карточки в приложении).
 * Цвета прибиты инлайном — почтовые клиенты не умеют CSS-классы.
 */
function magicLinkHtml(url: string) {
	return `<!doctype html>
<html lang="ru">
<body style="margin:0;padding:0;background-color:#0c0a09;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
	<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0c0a09;padding:48px 16px;">
		<tr>
			<td align="center">
				<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;">
					<tr>
						<td align="center" style="padding-bottom:20px;">
							<span style="font-size:17px;font-weight:700;letter-spacing:-0.01em;color:#fafaf9;">Ideapick</span>
						</td>
					</tr>
					<tr>
						<td style="background-color:#1c1917;border:1px solid #292524;border-radius:16px;padding:36px 32px;">
							<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
								<tr>
									<td align="center" style="padding-bottom:6px;">
										<!-- янтарная полоска-акцент, как разделители в интерфейсе -->
										<table role="presentation" cellpadding="0" cellspacing="0"><tr>
											<td style="width:44px;height:3px;background-color:#f59e0b;border-radius:2px;font-size:0;line-height:0;">&nbsp;</td>
										</tr></table>
									</td>
								</tr>
								<tr>
									<td align="center" style="font-size:20px;font-weight:700;letter-spacing:-0.01em;color:#fafaf9;padding:14px 0 10px;">
										Вход в Ideapick
									</td>
								</tr>
								<tr>
									<td align="center" style="font-size:14px;line-height:1.65;color:#a8a29e;padding-bottom:26px;">
										Нажмите на кнопку, чтобы войти в аккаунт.<br>
										Ссылка одноразовая и действует ограниченное время.
									</td>
								</tr>
								<tr>
									<td align="center" style="padding-bottom:26px;">
										<a href="${url}" style="display:inline-block;background-color:#f59e0b;color:#0c0a09;font-size:14px;font-weight:600;text-decoration:none;padding:13px 36px;border-radius:12px;">
											Войти в аккаунт
										</a>
									</td>
								</tr>
								<tr>
									<td style="font-size:12px;line-height:1.6;color:#78716c;border-top:1px solid #292524;padding-top:18px;">
										Если кнопка не открывается, скопируйте ссылку в браузер:<br>
										<a href="${url}" style="color:#a8a29e;text-decoration:underline;word-break:break-all;">${url}</a>
									</td>
								</tr>
							</table>
						</td>
					</tr>
					<tr>
						<td align="center" style="font-size:12px;line-height:1.6;color:#57534e;padding-top:20px;">
							Не запрашивали вход? Просто проигнорируйте это письмо —<br>
							без этой ссылки войти в аккаунт никто не сможет.
						</td>
					</tr>
					<tr>
						<td align="center" style="font-size:12px;color:#57534e;padding-top:14px;">
							© Ideapick · <a href="mailto:support@ideapick.ru" style="color:#78716c;text-decoration:none;">support@ideapick.ru</a>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>`;
}

/**
 * Отправка письма со ссылкой для входа (magic link) через SMTP
 * (почта Timeweb, ящик support@ideapick.ru).
 *
 * Если SMTP_USER/SMTP_PASSWORD не заданы: в dev ссылка печатается
 * в консоль сервера, в production пишется предупреждение.
 */
export async function sendMagicLinkEmail({ email, url }: MagicLinkEmailArgs) {
	const user = process.env.SMTP_USER;
	const password = process.env.SMTP_PASSWORD;

	if (!user || !password) {
		if (process.env.NODE_ENV !== "production") {
			console.info(`\n[magic-link] вход для ${email}:\n${url}\n`);
			return;
		}
		console.warn(
			`[magic-link] SMTP не настроен; ссылка для ${email}: ${url}`,
		);
		return;
	}

	const { default: nodemailer } = await import("nodemailer");
	const { lookup } = await import("node:dns/promises");

	const hostname = process.env.SMTP_HOST ?? "smtp.timeweb.ru";
	const port = Number(process.env.SMTP_PORT ?? 465);

	// Внутренний DNS-резолв nodemailer (dns.resolve4) на Windows может
	// занимать ~60 секунд из-за нерабочего DNS-сервера в списке адаптеров.
	// Поэтому резолвим хост системным резолвером (быстрый, с кэшем ОС)
	// и передаём готовый IP; servername нужен для проверки TLS-сертификата.
	let host = hostname;
	try {
		const { address } = await lookup(hostname, { family: 4 });
		host = address;
	} catch {
		// не зарезолвилось — пусть nodemailer попробует сам по hostname
	}

	const transporter = nodemailer.createTransport({
		host,
		port,
		secure: port === 465,
		auth: { user, pass: password },
		tls: { servername: hostname },
		connectionTimeout: 10_000,
		greetingTimeout: 10_000,
		socketTimeout: 20_000,
	});

	try {
		await transporter.sendMail({
			from: process.env.EMAIL_FROM ?? `Ideapick <${user}>`,
			to: email,
			subject: "Вход в Ideapick",
			html: magicLinkHtml(url),
			text: `Ссылка для входа в Ideapick: ${url}\n\nЕсли вы не запрашивали вход, проигнорируйте это письмо.`,
		});
	} catch (error) {
		console.error(`[magic-link] ошибка отправки для ${email}:`, error);
		throw new Error("Не удалось отправить письмо для входа");
	}
}
