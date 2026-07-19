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

function buildPayload(formData: FormData) {
  const rating = formData.get('rating');
  return {
    authorName: formData.get('authorName'),
    authorTitle: textOrUndefined(formData, 'authorTitle'),
    companyName: textOrUndefined(formData, 'companyName'),
    country: textOrUndefined(formData, 'country'),
    avatarUrl: textOrUndefined(formData, 'avatarUrl'),
    quote: formData.get('quote'),
    rating: rating ? Number(rating) : undefined,
    published: formData.get('published') === 'on',
  };
}

export async function createTestimonialAction(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  try {
    await adminFetch('/testimonials', { method: 'POST', body: JSON.stringify(buildPayload(formData)) });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '创建失败' };
  }
  revalidatePath('/admin/testimonials');
  redirect('/admin/testimonials');
}

export async function updateTestimonialAction(
  id: number,
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  try {
    await adminFetch(`/testimonials/${id}`, { method: 'PATCH', body: JSON.stringify(buildPayload(formData)) });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '保存失败' };
  }
  revalidatePath('/admin/testimonials');
  redirect('/admin/testimonials');
}

export async function deleteTestimonialAction(formData: FormData): Promise<void> {
  const id = formData.get('id');
  await adminFetch(`/testimonials/${id}`, { method: 'DELETE' });
  revalidatePath('/admin/testimonials');
}
