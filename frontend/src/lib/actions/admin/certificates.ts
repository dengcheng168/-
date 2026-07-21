'use server';

import { revalidatePath } from 'next/cache';
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
  redirect('/admin/certificates');
}

export async function deleteCertificateAction(formData: FormData): Promise<void> {
  const id = formData.get('id');
  await adminFetch(`/certificates/${id}`, { method: 'DELETE' });
  revalidatePath('/admin/certificates');
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
