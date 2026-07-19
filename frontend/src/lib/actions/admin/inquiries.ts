'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { adminFetch } from '@/lib/api/admin-client';
import { ApiError } from '@/lib/api/client';
import type { AdminFormState } from './categories';

export async function updateInquiryAction(id: number, _prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  try {
    await adminFetch(`/inquiries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: formData.get('status'),
        adminNotes: formData.get('adminNotes'),
      }),
    });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '保存失败' };
  }
  revalidatePath('/admin/inquiries');
  revalidatePath(`/admin/inquiries/${id}`);
  return { success: true, message: '已保存' };
}

export async function deleteInquiryAction(formData: FormData): Promise<void> {
  const id = formData.get('id');
  await adminFetch(`/inquiries/${id}`, { method: 'DELETE' });
  revalidatePath('/admin/inquiries');
  redirect('/admin/inquiries');
}
