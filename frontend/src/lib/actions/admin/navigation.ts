'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { adminFetch } from '@/lib/api/admin-client';
import { ApiError } from '@/lib/api/client';
import type { AdminFormState } from './categories';

function buildPayload(formData: FormData) {
  return {
    label: formData.get('label'),
    url: formData.get('url'),
    sortOrder: Number(formData.get('sortOrder') || 0),
    visible: formData.get('visible') === 'on',
    openInNewTab: formData.get('openInNewTab') === 'on',
  };
}

export async function createNavItemAction(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  try {
    await adminFetch('/navigation', { method: 'POST', body: JSON.stringify(buildPayload(formData)) });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '创建失败' };
  }
  revalidatePath('/admin/navigation');
  redirect('/admin/navigation');
}

export async function updateNavItemAction(id: number, _prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  try {
    await adminFetch(`/navigation/${id}`, { method: 'PATCH', body: JSON.stringify(buildPayload(formData)) });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '保存失败' };
  }
  revalidatePath('/admin/navigation');
  redirect('/admin/navigation');
}

export async function deleteNavItemAction(formData: FormData): Promise<void> {
  const id = formData.get('id');
  await adminFetch(`/navigation/${id}`, { method: 'DELETE' });
  revalidatePath('/admin/navigation');
}
