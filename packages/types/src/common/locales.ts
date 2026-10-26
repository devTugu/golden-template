/** Single source for CMS localized fields and frontend i18n routing. */
export const SUPPORTED_LOCALES = ["en", "mn"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "en";
