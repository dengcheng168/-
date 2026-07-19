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
    await adminFetch('/blog', { method: 'POST', body: JSON.stringify(buildPayload(formData)) });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '创建失败' };
  }
  revalidatePath('/admin/blog');
  redirect('/admin/blog');
}

export async function updateBlogPostAction(id: number, _prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  try {
    await adminFetch(`/blog/${id}`, { method: 'PATCH', body: JSON.stringify(buildPayload(formData)) });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '保存失败' };
  }
  revalidatePath('/admin/blog');
  redirect('/admin/blog');
}

export async function deleteBlogPostAction(formData: FormData): Promise<void> {
  const id = formData.get('id');
  await adminFetch(`/blog/${id}`, { method: 'DELETE' });
  revalidatePath('/admin/blog');
}
