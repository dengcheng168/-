import { apiFetch } from './client';
import type { SupportedLocale } from '@/lib/i18n/locales';

// 构建期后端不可达时的兜底空值：见 lib/api/settings.ts 顶部注释——返回空表等同于全部回退显示英文原文
export async function getTranslationMap(locale: SupportedLocale): Promise<Record<string, string>> {
  try {
    const { data } = await apiFetch<Record<string, string>>(`/translations/${locale}`, {
      revalidate: 300,
      tags: [`translations:${locale}`],
    });
    return data;
  } catch {
    return {};
  }
}

/** value 为空/未翻译时回退显示 fallback（英文原文），不会出现空白内容 */
export function translate(map: Record<string, string>, key: string, fallback: string): string {
  const value = map[key];
  return value && value.trim() !== '' ? value : fallback;
}
