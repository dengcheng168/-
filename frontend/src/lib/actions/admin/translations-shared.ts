import 'server-only';
import { updateTag } from 'next/cache';
import { adminFetch } from '@/lib/api/admin-client';
import { ApiError } from '@/lib/api/client';
import { localizedTag } from '@/lib/i18n/localize';
import type { Locale } from '@/lib/i18n/locales';

export interface TranslationFormState {
  message?: string;
  success?: boolean;
}

export interface TranslationRecord {
  translationStatus: string;
  updatedAt: string;
  updatedBy: number | null;
}

/**
 * 后台 Español 标签页专用：GET /admin/{resource}/translations/{locale} 目前还没有译文时
 * 后端返回 200 + data: null（见 Phase B 的 get*Translation），不是 404，所以这里不用 .catch(null)。
 */
export async function fetchTranslation<T>(path: string): Promise<(T & TranslationRecord) | null> {
  const { data } = await adminFetch<(T & TranslationRecord) | null>(path);
  return data;
}

/**
 * 保存译文的通用逻辑：请求失败时返回错误信息给表单；成功时只刷新该 locale 的缓存 tag，
 * 绝不刷新不带 locale 后缀的英文 tag——editing 西语内容不能让英文页面被动重新拉取。
 */
export async function saveTranslation(
  path: string,
  payload: Record<string, unknown>,
  cacheTags: string[],
): Promise<TranslationFormState> {
  try {
    await adminFetch(path, { method: 'PATCH', body: JSON.stringify(payload) });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '保存失败' };
  }
  for (const tag of cacheTags) updateTag(tag);
  return { success: true, message: '西班牙语内容已保存' };
}

export function localeCacheTags(baseTag: string, locale: Locale): string[] {
  return localizedTag(baseTag, locale);
}

function textOrUndefined(formData: FormData, key: string): string | undefined {
  const v = formData.get(key);
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined;
}

export function translationStatusFromForm(formData: FormData): string {
  return formData.get('translationStatus') === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';
}

export { textOrUndefined };
