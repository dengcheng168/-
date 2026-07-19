import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME } from '@/config/constants';

export interface AdminUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
}

function resolveBackendBase(): string {
  const internalBase = process.env.INTERNAL_API_BASE_URL ?? 'http://localhost:4000';
  return `${internalBase}/api`;
}

/**
 * 服务端会话校验（Data Access Layer）：向后端 /api/auth/me 转发当前 Cookie 做真实校验，
 * 而不是仅凭 Cookie 是否存在做判断。用 React cache 在同一次渲染中去重，避免重复请求。
 */
export const getCurrentAdmin = cache(async (): Promise<AdminUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${resolveBackendBase()}/auth/me`, {
      cache: 'no-store',
      headers: { Cookie: `${ADMIN_COOKIE_NAME}=${token}` },
    });
    if (!res.ok) return null;
    const body = await res.json();
    return body.data as AdminUser;
  } catch {
    return null;
  }
});
