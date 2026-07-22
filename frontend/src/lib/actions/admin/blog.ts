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

function buildPayload(formData: FormData) {
  const tagIds = formData.getAll('tagIds').map((v) => Number(v));
  return {
    title: formData.get('title'),
    excerpt: textOrUndefined(formData, 'excerpt'),
    body: formData.get('body'),
    coverImage: textOrUndefined(formData, 'coverImage'),
    categoryId: Number(formData.get('categoryId')),
    authorName: textOrUndefined(formData, 'authorName'),
    status: formData.get('status'),
    seoTitle: textOrUndefined(formData, 'seoTitle'),
    seoDescription: textOrUndefined(formData, 'seoDescription'),
    tagIds,
  };
}

export async function createBlogPostAction(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  try {
    const { data } = await adminFetch<{ slug: string }>('/blog', { method: 'POST', body: JSON.stringify(buildPayload(formData)) });
    revalidatePath('/admin/blog');
    updateTag('blog');
    updateTag(`blog:${data.slug}`);
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '创建失败' };
  }
  redirect('/admin/blog');
}

export async function updateBlogPostAction(id: number, _prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  try {
    const { data } = await adminFetch<{ slug: string }>(`/blog/${id}`, { method: 'PATCH', body: JSON.stringify(buildPayload(formData)) });
    revalidatePath('/admin/blog');
    updateTag('blog');
    updateTag(`blog:${data.slug}`);
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '保存失败' };
  }
  redirect('/admin/blog');
}

export async function deleteBlogPostAction(formData: FormData): Promise<void> {
  const id = formData.get('id');
  await adminFetch(`/blog/${id}`, { method: 'DELETE' });
  revalidatePath('/admin/blog');
  updateTag('blog');
}

export async function updateBlogPostTranslationAction(
  id: number,
  locale: Locale,
  slug: string | undefined,
  _prevState: TranslationFormState,
  formData: FormData,
): Promise<TranslationFormState> {
  const payload = {
    title: textOrUndefined(formData, 'title'),
    excerpt: textOrUndefined(formData, 'excerpt'),
    body: textOrUndefined(formData, 'body'),
    seoTitle: textOrUndefined(formData, 'seoTitle'),
    seoDescription: textOrUndefined(formData, 'seoDescription'),
    translationStatus: translationStatusFromForm(formData),
  };
  const tags = [...localeCacheTags('blog', locale), ...(slug ? localeCacheTags(`blog:${slug}`, locale) : [])];
  return saveTranslation(`/blog/${id}/translations/${locale}`, payload, tags);
}
