'use server';

import { revalidatePath } from 'next/cache';
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

export async function createBlogCategoryAction(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  try {
    await adminFetch('/blog-categories', {
      method: 'POST',
      body: JSON.stringify({
        name: formData.get('name'),
        description: textOrUndefined(formData, 'description'),
        published: formData.get('published') === 'on',
      }),
    });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '创建失败' };
  }
  revalidatePath('/admin/blog-categories');
  redirect('/admin/blog-categories');
}

export async function updateBlogCategoryAction(
  id: number,
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  try {
    await adminFetch(`/blog-categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: formData.get('name'),
        description: textOrUndefined(formData, 'description'),
        published: formData.get('published') === 'on',
      }),
    });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '保存失败' };
  }
  revalidatePath('/admin/blog-categories');
  redirect('/admin/blog-categories');
}

export async function deleteBlogCategoryAction(formData: FormData): Promise<void> {
  const id = formData.get('id');
  await adminFetch(`/blog-categories/${id}`, { method: 'DELETE' });
  revalidatePath('/admin/blog-categories');
}

export async function updateBlogCategoryTranslationAction(
  id: number,
  locale: Locale,
  _prevState: TranslationFormState,
  formData: FormData,
): Promise<TranslationFormState> {
  const payload = {
    name: textOrUndefined(formData, 'name'),
    description: textOrUndefined(formData, 'description'),
    translationStatus: translationStatusFromForm(formData),
  };
  const tags = localeCacheTags('blog-categories', locale);
  return saveTranslation(`/blog-categories/${id}/translations/${locale}`, payload, tags);
}
