/** 与后端 backend/src/modules/translations/translations.schema.ts 的 SUPPORTED_LOCALES 保持一致 */
export const SUPPORTED_LOCALES = ['es'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export type Locale = 'en' | SupportedLocale;

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
};

export function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
