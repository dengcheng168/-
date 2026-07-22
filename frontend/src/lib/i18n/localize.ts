import type { Locale } from './locales';

/**
 * 用某个实体的 translation 覆盖英文原始字段，只在译文非空时才覆盖——空字符串/undefined/null
 * 一律视为"没有译文"，回退显示英文，不能因为传了个空/部分翻译对象就把整页内容清空。
 * 数组/对象类字段（features/specs/applications/sections）非空即整体覆盖，不做深度合并。
 */
export function resolveLocalizedEntity<T extends object>(
  source: T,
  translation: Partial<T> | null | undefined,
  fields: (keyof T)[],
): T {
  if (!translation) return source;
  const result = { ...source } as Record<keyof T, unknown>;
  for (const field of fields) {
    const value = (translation as Record<keyof T, unknown>)[field];
    if (value == null) continue;
    if (typeof value === 'string') {
      if (value.trim() !== '') result[field] = value;
    } else {
      result[field] = value;
    }
  }
  return result as T;
}

/** 请求后端时用的 query 参数值：英文不传 locale（走现有零开销路径），其它语言原样传 */
export function localeQueryParam(locale: Locale): string | undefined {
  return locale === 'en' ? undefined : locale;
}

/** 给 fetch tags 用：英文不追加 locale 维度的 tag，其它语言追加，方便 Phase I 按 locale 精确失效 */
export function localizedTag(tag: string, locale: Locale): string[] {
  return locale === 'en' ? [] : [`${tag}:${locale}`];
}
