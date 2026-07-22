'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentAdmin } from '@/lib/auth/session';
import type { AdminFormState } from './categories';

// 缓存清理不经过后端（Next.js 的路由缓存完全在前端服务器内），adminFetch 也就不会帮忙做权限校验，
// 所以这个 action 必须自己查当前登录人角色——否则它会是后台唯一一个没有服务端权限校验的写操作入口。
const CACHE_MANAGE_ROLES = ['SUPER_ADMIN', 'CONTENT_ADMIN'];

export async function clearSiteCacheAction(): Promise<AdminFormState> {
  const user = await getCurrentAdmin();
  if (!user || !CACHE_MANAGE_ROLES.includes(user.role)) {
    return { message: '权限不足' };
  }

  revalidatePath('/', 'layout');
  return { success: true, message: '已清除全站缓存，前台页面会在下次访问时重新生成' };
}
