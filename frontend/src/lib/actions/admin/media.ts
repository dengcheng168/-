'use server';

import { revalidatePath } from 'next/cache';
import { adminFetch } from '@/lib/api/admin-client';
import { ApiError } from '@/lib/api/client';

export interface MediaActionState {
  message?: string;
}

export async function deleteMediaAction(formData: FormData): Promise<void> {
  const id = formData.get('id');
  try {
    await adminFetch(`/media/${id}`, { method: 'DELETE' });
  } catch {
    // 忽略：仍被引用时后端会返回 409，用户可通过再次点击查看提示（此处简化不做 toast）
  }
  revalidatePath('/admin/media');
}

export async function updateMediaAltAction(id: number, _prevState: MediaActionState, formData: FormData): Promise<MediaActionState> {
  try {
    await adminFetch(`/media/${id}`, { method: 'PATCH', body: JSON.stringify({ altText: formData.get('altText') }) });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '保存失败' };
  }
  revalidatePath('/admin/media');
  return { message: '已保存' };
}
