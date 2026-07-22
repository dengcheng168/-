'use server';

import { updateTag, revalidatePath } from 'next/cache';
import { adminFetch } from '@/lib/api/admin-client';
import { ApiError } from '@/lib/api/client';
import type { AdminFormState } from './categories';

const KEY_PREFIX = 't__';

export async function saveTranslationsAction(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const entries: { key: string; value: string }[] = [];
  for (const [name, value] of formData.entries()) {
    if (name.startsWith(KEY_PREFIX) && typeof value === 'string') {
      entries.push({ key: name.slice(KEY_PREFIX.length), value });
    }
  }

  try {
    await adminFetch('/translations', { method: 'PATCH', body: JSON.stringify({ locale: 'es', entries }) });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '保存失败' };
  }

  updateTag('translations:es');
  revalidatePath('/es');
  revalidatePath('/es/faq');
  return { success: true, message: '已保存，前台西班牙语页面已刷新' };
}
