'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { adminFetch } from '@/lib/api/admin-client';
import { ApiError } from '@/lib/api/client';
import { saveTranslation, localeCacheTags, translationStatusFromForm } from './translations-shared';
import type { TranslationFormState } from './translations-shared';
import type { Locale } from '@/lib/i18n/locales';

export interface AdminFormState {
  message?: string;
  success?: boolean;
}

function textOrUndefined(formData: FormData, key: string): string | undefined {
  const v = formData.get(key);
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined;
}

export async function createCategoryAction(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  try {
    await adminFetch('/product-categories', {
      method: 'POST',
      body: JSON.stringify({
        name: formData.get('name'),
        description: textOrUndefined(formData, 'description'),
        image: textOrUndefined(formData, 'image'),
        published: formData.get('published') === 'on',
      }),
    });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '创建失败' };
  }
  revalidatePath('/admin/product-categories');
  // 之前只刷新了后台列表页路由缓存，前台 /products 和 /products/category/:slug 用的是
  // lib/api/products.ts 里带 'product-categories' tag 的 fetch 缓存，不刷新的话要等 5
  // 分钟 ISR 窗口才会显示新分类；这个 tag 同时覆盖英文和西语请求（西语只是额外多一个
  // 'product-categories:es' tag，不会互相影响），所以这里刷新对两边都生效
  updateTag('product-categories');
  redirect('/admin/product-categories');
}

export async function updateCategoryAction(
  id: number,
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  try {
    await adminFetch(`/product-categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: formData.get('name'),
        description: textOrUndefined(formData, 'description'),
        image: textOrUndefined(formData, 'image'),
        published: formData.get('published') === 'on',
      }),
    });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '保存失败' };
  }
  revalidatePath('/admin/product-categories');
  updateTag('product-categories');
  redirect('/admin/product-categories');
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  const id = formData.get('id');
  await adminFetch(`/product-categories/${id}`, { method: 'DELETE' });
  revalidatePath('/admin/product-categories');
  updateTag('product-categories');
}

export async function updateCategoryTranslationAction(
  id: number,
  locale: Locale,
  _prevState: TranslationFormState,
  formData: FormData,
): Promise<TranslationFormState> {
  const payload = {
    name: textOrUndefined(formData, 'name'),
    description: textOrUndefined(formData, 'description'),
    seoTitle: textOrUndefined(formData, 'seoTitle'),
    seoDescription: textOrUndefined(formData, 'seoDescription'),
    translationStatus: translationStatusFromForm(formData),
  };
  const tags = localeCacheTags('product-categories', locale);
  return saveTranslation(`/product-categories/${id}/translations/${locale}`, payload, tags);
}
