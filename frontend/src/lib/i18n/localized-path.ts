import type { Locale } from './locales';
import { localeHref } from './paths';

/**
 * 语言切换器专用：把"当前路径"（可能已经带 /es 前缀）转换成目标 locale 下的对应路径，
 * 保留动态 slug（/products/xxx -> /es/products/xxx）。查询参数、hash 由调用方
 * （LanguageSwitcher）单独拼接，这里只处理纯路径部分。
 */
export function getLocalizedPath(pathname: string, targetLocale: Locale): string {
  const english = pathname === '/es' || pathname.startsWith('/es/') ? pathname.slice(3) || '/' : pathname;
  return localeHref(english, targetLocale);
}
