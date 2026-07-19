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

export async function updatePageAction(slug: string, _prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const sectionsRaw = textOrUndefined(formData, 'sectionsJson');
  let sections: unknown;
  if (sectionsRaw) {
    try {
      sections = JSON.parse(sectionsRaw);
    } catch {
      return { message: '结构化区块内容不是合法的 JSON 格式' };
    }
  }

  try {
    await adminFetch(`/pages/${slug}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: formData.get('title'),
        bodyHtml: textOrUndefined(formData, 'bodyHtml'),
        sections,
        seoTitle: textOrUndefined(formData, 'seoTitle'),
        seoDescription: textOrUndefined(formData, 'seoDescription'),
      }),
    });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '保存失败' };
  }
  revalidatePath('/admin/pages');
  redirect('/admin/pages');
}
