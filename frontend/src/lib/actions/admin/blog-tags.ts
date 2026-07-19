'use server';

import { revalidatePath } from 'next/cache';
import { adminFetch } from '@/lib/api/admin-client';
import { ApiError } from '@/lib/api/client';
import type { AdminFormState } from './categories';

export async function createBlogTagAction(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  try {
    await adminFetch('/blog-tags', { method: 'POST', body: JSON.stringify({ name: formData.get('name') }) });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '创建失败' };
  }
  revalidatePath('/admin/blog-tags');
  return { success: true };
}

export async function deleteBlogTagAction(formData: FormData): Promise<void> {
  const id = formData.get('id');
  await adminFetch(`/blog-tags/${id}`, { method: 'DELETE' });
  revalidatePath('/admin/blog-tags');
}
