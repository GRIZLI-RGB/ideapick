export const LEGAL_EFFECTIVE_DATE = "27 мая 2026 г.";

export const OPERATOR = {
	name: "Козлов Евгений Игоревич",
	inn: "722410633193",
	status: "самозанятый (плательщик налога на профессиональный доход)",
	location: "Россия, г. Тюмень",
	email: "support@ideapick.ru",
	phone: "+7 982 783-04-18",
	phoneHref: "+79827830418",
	site: "ideapick.ru",
} as const;

export type LegalPage = {
	href: string;
	title: string;
	description: string;
};

export const LEGAL_PAGES: LegalPage[] = [
	{
		href: "/terms",
		title: "Пользовательское соглашение",
		description: "Правила использования сервиса, оплата и оказание услуг",
	},
	{
		href: "/privacy",
		title: "Политика конфиденциальности",
		description: "Как мы обрабатываем персональные данные",
	},
];

export function getLegalPage(href: string): LegalPage | undefined {
	return LEGAL_PAGES.find((page) => page.href === href);
}
