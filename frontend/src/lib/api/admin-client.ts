import 'server-only';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME } from '@/config/constants';
import { ApiError, type ApiMeta } from './client';

export interface AdminApiResult<T> {
  data: T;
  meta?: ApiMeta;
}

function resolveAdminBaseUrl(): string {
  const internalBase = process.env.INTERNAL_API_BASE_URL ?? 'http://localhost:4000';
  return `${internalBase}/api/admin`;
}

/**
 * 仅供服务端组件 / Server Action 使用：自动把当前请求携带的 wp_session Cookie
 * 转发给后端 /api/admin/* 接口（服务端到服务端的 fetch 不会自动带上浏览器 Cookie，需要手动转发）。
 */
export async function adminFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<AdminApiResult<T>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  const res = await fetch(`${resolveAdminBaseUrl()}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Cookie: `${ADMIN_COOKIE_NAME}=${token}` } : {}),
      ...init.headers,
    },
  });

  let body: { success: true; data: T; meta?: ApiMeta } | { success: false; error: { message: string; code?: string; details?: unknown } } | undefined;
  try {
    body = await res.json();
  } catch {
    // 无 JSON 响应体（例如 CSV 导出），调用方自行处理
  }

  if (!res.ok || !body || body.success === false) {
    const errorBody = body as { success: false; error: { message: string; code?: string; details?: unknown } } | undefined;
    throw new ApiError(
      errorBody?.error?.message ?? `请求失败：${res.status}`,
      res.status,
      errorBody?.error?.code,
      errorBody?.error?.details,
    );
  }

  return { data: body.data, meta: body.meta };
}
