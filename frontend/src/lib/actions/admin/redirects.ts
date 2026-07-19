'use server';

import { revalidatePath } from 'next/cache';
import { adminFetch } from '@/lib/api/admin-client';
import { ApiError } from '@/lib/api/client';
import type { AdminFormState } from './categories';

export async function createRedirectAction(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  try {
    await adminFetch('/redirects', {
      method: 'POST',
      body: JSON.stringify({
        fromPath: formData.get('fromPath'),
        toPath: formData.get('toPath'),
        statusCode: Number(formData.get('statusCode') || 301),
      }),
    });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '创建失败' };
  }
  revalidatePath('/admin/redirects');
  return { success: true };
}

export async function deleteRedirectAction(formData: FormData): Promise<void> {
  const id = formData.get('id');
  await adminFetch(`/redirects/${id}`, { method: 'DELETE' });
  revalidatePath('/admin/redirects');
}
