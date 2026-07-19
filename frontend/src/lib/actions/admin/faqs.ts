'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { adminFetch } from '@/lib/api/admin-client';
import { ApiError } from '@/lib/api/client';
import type { AdminFormState } from './categories';

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
  redirect('/admin/faqs');
}

export async function deleteFaqAction(formData: FormData): Promise<void> {
  const id = formData.get('id');
  await adminFetch(`/faqs/${id}`, { method: 'DELETE' });
  revalidatePath('/admin/faqs');
}
