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
    name: formData.get('name'),
    certType: textOrUndefined(formData, 'certType'),
    certNumber: textOrUndefined(formData, 'certNumber'),
    issuingAuthority: textOrUndefined(formData, 'issuingAuthority'),
    issueDate: textOrUndefined(formData, 'issueDate'),
    expiryDate: textOrUndefined(formData, 'expiryDate'),
    imageUrl: formData.get('imageUrl'),
    pdfUrl: textOrUndefined(formData, 'pdfUrl'),
    description: textOrUndefined(formData, 'description'),
    published: formData.get('published') === 'on',
  };
}

export async function createCertificateAction(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  try {
    await adminFetch('/certificates', { method: 'POST', body: JSON.stringify(buildPayload(formData)) });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '创建失败' };
  }
  revalidatePath('/admin/certificates');
  updateTag('certificates');
  redirect('/admin/certificates');
}

export async function updateCertificateAction(
  id: number,
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  try {
    await adminFetch(`/certificates/${id}`, { method: 'PATCH', body: JSON.stringify(buildPayload(formData)) });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '保存失败' };
  }
  revalidatePath('/admin/certificates');
  updateTag('certificates');
  redirect('/admin/certificates');
}

/**
 * 供证书列表"排序"列的输入框直接调用，复用后端已有的批量重排接口
 * POST /admin/certificates/reorder（只传一条记录，等价于单条更新 sortOrder）。
 */
export async function setCertificateSortOrderAction(id: number, sortOrder: number): Promise<AdminFormState> {
  try {
    await adminFetch('/certificates/reorder', { method: 'POST', body: JSON.stringify({ items: [{ id, sortOrder }] }) });
  } catch (err) {
    return { success: false, message: err instanceof ApiError ? err.message : '排序更新失败' };
  }
  revalidatePath('/admin/certificates');
  updateTag('certificates');
  return { success: true, message: '排序已更新' };
}

export async function deleteCertificateAction(formData: FormData): Promise<void> {
  const id = formData.get('id');
  await adminFetch(`/certificates/${id}`, { method: 'DELETE' });
  revalidatePath('/admin/certificates');
  updateTag('certificates');
}

export async function updateCertificateTranslationAction(
  id: number,
  locale: Locale,
  _prevState: TranslationFormState,
  formData: FormData,
): Promise<TranslationFormState> {
  const payload = {
    name: textOrUndefined(formData, 'name'),
    description: textOrUndefined(formData, 'description'),
    translationStatus: translationStatusFromForm(formData),
  };
  const tags = localeCacheTags('certificates', locale);
  return saveTranslation(`/certificates/${id}/translations/${locale}`, payload, tags);
}
