'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { adminFetch } from '@/lib/api/admin-client';
import { ApiError } from '@/lib/api/client';
import type { AdminFormState } from './categories';
import { saveTranslation, localeCacheTags, translationStatusFromForm } from './translations-shared';
import type { TranslationFormState } from './translations-shared';
import type { Locale } from '@/lib/i18n/locales';

function textOrUndefined(formData: FormData, key: string): string | undefined {
  const v = formData.get(key);
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined;
}

function buildPayload(formData: FormData) {
  return {
    title: formData.get('title'),
    // 用 ?? 而不是 textOrUndefined：清空图片后保存要能真正清空数据库字段（回退到占位图）
    imageUrl: formData.get('imageUrl') ?? undefined,
    description: textOrUndefined(formData, 'description'),
    published: formData.get('published') === 'on',
  };
}

export async function createFactoryGalleryItemAction(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  try {
    await adminFetch('/factory-gallery', { method: 'POST', body: JSON.stringify(buildPayload(formData)) });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '创建失败' };
  }
  revalidatePath('/admin/factory-gallery');
  updateTag('factory-gallery');
  redirect('/admin/factory-gallery');
}

export async function updateFactoryGalleryItemAction(
  id: number,
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  try {
    await adminFetch(`/factory-gallery/${id}`, { method: 'PATCH', body: JSON.stringify(buildPayload(formData)) });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '保存失败' };
  }
  revalidatePath('/admin/factory-gallery');
  updateTag('factory-gallery');
  return { success: true, message: '已保存' };
}

/**
 * 供列表"排序"列的输入框直接调用，复用后端已有的批量重排接口
 * POST /admin/factory-gallery/reorder（只传一条记录，等价于单条更新 sortOrder）。
 */
export async function setFactoryGalleryItemSortOrderAction(id: number, sortOrder: number): Promise<AdminFormState> {
  try {
    await adminFetch('/factory-gallery/reorder', { method: 'POST', body: JSON.stringify({ items: [{ id, sortOrder }] }) });
  } catch (err) {
    return { success: false, message: err instanceof ApiError ? err.message : '排序更新失败' };
  }
  revalidatePath('/admin/factory-gallery');
  updateTag('factory-gallery');
  return { success: true, message: '排序已更新' };
}

export async function deleteFactoryGalleryItemAction(formData: FormData): Promise<void> {
  const id = formData.get('id');
  await adminFetch(`/factory-gallery/${id}`, { method: 'DELETE' });
  revalidatePath('/admin/factory-gallery');
  updateTag('factory-gallery');
}

export async function updateFactoryGalleryItemTranslationAction(
  id: number,
  locale: Locale,
  _prevState: TranslationFormState,
  formData: FormData,
): Promise<TranslationFormState> {
  const payload = {
    title: textOrUndefined(formData, 'title'),
    description: textOrUndefined(formData, 'description'),
    translationStatus: translationStatusFromForm(formData),
  };
  const tags = localeCacheTags('factory-gallery', locale);
  return saveTranslation(`/factory-gallery/${id}/translations/${locale}`, payload, tags);
}
