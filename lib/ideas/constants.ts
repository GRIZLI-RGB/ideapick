export const PRICES = {
	analysis: 99,
	anamnesis: 49,
	welcomeBonus: 100,
} as const;

// Лимит каталога — одна бесплатная идея в сутки (00:00 МСК); зашит в
// lib/ideas/catalog.ts (claimCatalogIdea), отдельной константы нет.
