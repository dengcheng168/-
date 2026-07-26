import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME } from '@/config/constants';

// 幂等登出端点：路径以 /api/admin 开头，不落在 proxy.ts 的 '/admin/:path*' matcher 覆盖范围内，
// 因此不会被"未登录 -> 404"的保护逻辑拦截，从架构上避免了多标签页竞态时第二个请求收到裸 404 的问题。
// 无论 Cookie 是否存在都返回 204，重复调用安全。不做会话有效性校验（校验交给 getCurrentAdmin），
// 只负责"删掉本地这份 Cookie"这一件事，不改变后端认证协议。
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  return new NextResponse(null, { status: 204 });
}
