'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { adminFetch } from '@/lib/api/admin-client';
import { ApiError } from '@/lib/api/client';
import type { AdminFormState } from './categories';
import { saveTranslation, localeCacheTags, translationStatusFromForm } from './translations-shared';
import type { TranslationFormState } from './translations-shared';
import type { Locale } from '@/lib/i18n/locales';

function textOrUndefined(formData: FormData, key: string): string | undefined {
  const v = formData.get(key);
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined;
}

export async function updatePageAction(slug: string, _prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const sectionsRaw = textOrUndefined(formData, 'sectionsJson');
  let sections: unknown;
  if (sectionsRaw) {
    try {
      sections = JSON.parse(sectionsRaw);
    } catch {
      return { message: '结构化区块内容不是合法的 JSON 格式' };
    }
  }

  try {
    await adminFetch(`/pages/${slug}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: formData.get('title'),
        bodyHtml: textOrUndefined(formData, 'bodyHtml'),
        sections,
        seoTitle: textOrUndefined(formData, 'seoTitle'),
        seoDescription: textOrUndefined(formData, 'seoDescription'),
        // 用 ?? 而不是 textOrUndefined：图片字段允许清空成空字符串（移除背景图），
        // textOrUndefined 会把空字符串也变成 undefined，导致"移除图片"点了也保存不掉
        heroImage: formData.get('heroImage') ?? undefined,
        heroImageMobile: formData.get('heroImageMobile') ?? undefined,
      }),
    });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '保存失败' };
  }
  revalidatePath('/admin/pages');
  // 之前只刷新了后台列表页，公开页面（/about /contact 等）用的是这个 tag 缓存的数据，
  // 不刷新的话编辑内容要等 5 分钟 ISR 窗口自然过期才会出现在前台，编辑者会以为没保存成功
  updateTag('pages');
  updateTag(`page:${slug}`);
  redirect('/admin/pages');
}

export async function updatePageTranslationAction(
  slug: string,
  locale: Locale,
  _prevState: TranslationFormState,
  formData: FormData,
): Promise<TranslationFormState> {
  const sectionsRaw = textOrUndefined(formData, 'sectionsJson');
  let sections: unknown;
  if (sectionsRaw) {
    try {
      sections = JSON.parse(sectionsRaw);
    } catch {
      return { message: '结构化区块内容不是合法的 JSON 格式' };
    }
  }

  const payload = {
    title: textOrUndefined(formData, 'title'),
    bodyHtml: textOrUndefined(formData, 'bodyHtml'),
    sections,
    seoTitle: textOrUndefined(formData, 'seoTitle'),
    seoDescription: textOrUndefined(formData, 'seoDescription'),
    translationStatus: translationStatusFromForm(formData),
  };
  const tags = [...localeCacheTags('pages', locale), ...localeCacheTags(`page:${slug}`, locale)];
  return saveTranslation(`/pages/${slug}/translations/${locale}`, payload, tags);
}
