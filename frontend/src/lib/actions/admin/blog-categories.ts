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
