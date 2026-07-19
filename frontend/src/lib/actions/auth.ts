'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE_NAME, ADMIN_LOGIN_PATH } from '@/config/constants';

const COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export interface LoginFormState {
  message?: string;
}

function resolveBackendBase(): string {
  const internalBase = process.env.INTERNAL_API_BASE_URL ?? 'http://localhost:4000';
  return `${internalBase}/api`;
}

export async function loginAction(_prevState: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const email = formData.get('email');
  const password = formData.get('password');

  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return { message: '请输入邮箱和密码' };
  }

  let token: string | undefined;
  try {
    const res = await fetch(`${resolveBackendBase()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });
    const body = await res.json();

    if (!res.ok || !body.success) {
      return { message: body?.error?.message ?? '登录失败，请稍后重试' };
    }
    token = body.data.token as string;
  } catch {
    return { message: '无法连接服务器，请稍后重试' };
  }

  if (!token) {
    return { message: '登录失败，请稍后重试' };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });

  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect(ADMIN_LOGIN_PATH);
}
