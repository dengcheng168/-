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

export async function createFaqAction(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  try {
    await adminFetch('/faqs', {
      method: 'POST',
      body: JSON.stringify({
        question: formData.get('question'),
        answer: formData.get('answer'),
        category: textOrUndefined(formData, 'category'),
        published: formData.get('published') === 'on',
      }),
    });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '创建失败' };
  }
  revalidatePath('/admin/faqs');
  updateTag('faqs');
  redirect('/admin/faqs');
}

export async function updateFaqAction(id: number, _prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  try {
    await adminFetch(`/faqs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        question: formData.get('question'),
        answer: formData.get('answer'),
        category: textOrUndefined(formData, 'category'),
        published: formData.get('published') === 'on',
      }),
    });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '保存失败' };
  }
  revalidatePath('/admin/faqs');
  updateTag('faqs');
  redirect('/admin/faqs');
}

export async function deleteFaqAction(formData: FormData): Promise<void> {
  const id = formData.get('id');
  await adminFetch(`/faqs/${id}`, { method: 'DELETE' });
  revalidatePath('/admin/faqs');
  updateTag('faqs');
}

export async function updateFaqTranslationAction(
  id: number,
  locale: Locale,
  _prevState: TranslationFormState,
  formData: FormData,
): Promise<TranslationFormState> {
  const payload = {
    question: textOrUndefined(formData, 'question'),
    answer: textOrUndefined(formData, 'answer'),
    translationStatus: translationStatusFromForm(formData),
  };
  const tags = localeCacheTags('faqs', locale);
  return saveTranslation(`/faqs/${id}/translations/${locale}`, payload, tags);
}
