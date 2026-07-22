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

export async function createAdminUserAction(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  try {
    await adminFetch('/admin-users', {
      method: 'POST',
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password'),
        name: textOrUndefined(formData, 'name'),
        role: formData.get('role'),
      }),
    });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '创建失败' };
  }
  revalidatePath('/admin/settings/admin-users');
  redirect('/admin/settings/admin-users');
}

export async function updateAdminUserAction(id: number, _prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  try {
    await adminFetch(`/admin-users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: textOrUndefined(formData, 'name'),
        email: formData.get('email'),
        role: formData.get('role'),
        isActive: formData.get('isActive') === 'on',
      }),
    });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '保存失败' };
  }
  revalidatePath('/admin/settings/admin-users');
  revalidatePath(`/admin/settings/admin-users/${id}`);
  return { success: true, message: '已保存' };
}

export async function resetAdminUserPasswordAction(id: number, _prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const newPassword = formData.get('newPassword');
  try {
    await adminFetch(`/admin-users/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ newPassword }) });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '重置失败' };
  }
  return { success: true, message: '密码已重置，该管理员的登录状态已全部失效，需要用新密码重新登录' };
}

export async function unlockAdminUserAction(id: number): Promise<AdminFormState> {
  try {
    await adminFetch(`/admin-users/${id}/unlock`, { method: 'POST' });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '解锁失败' };
  }
  revalidatePath(`/admin/settings/admin-users/${id}`);
  return { success: true, message: '已解除锁定' };
}

export async function revokeAdminUserSessionsAction(id: number): Promise<AdminFormState> {
  try {
    await adminFetch(`/admin-users/${id}/revoke-sessions`, { method: 'POST' });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '操作失败' };
  }
  return { success: true, message: '已强制下线，该管理员需要重新登录' };
}
