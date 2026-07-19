'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { adminFetch } from '@/lib/api/admin-client';
import { ApiError } from '@/lib/api/client';

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
  redirect('/admin/product-categories');
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  const id = formData.get('id');
  await adminFetch(`/product-categories/${id}`, { method: 'DELETE' });
  revalidatePath('/admin/product-categories');
}
