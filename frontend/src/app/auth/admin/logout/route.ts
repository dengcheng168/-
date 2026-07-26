import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME } from '@/config/constants';

// 只信任浏览器自动附带的标准 Origin/Host 请求头做同源判断，不依赖任何客户端可伪造的自定义身份信息。
// 现代浏览器对 fetch 发起的 POST 请求总会带 Origin 头，缺失 Origin 头时判定为同站请求放行，
// 避免误伤同源但浏览器未带 Origin 的极少数合法场景（例如某些同站表单提交）。
export function isSameOriginRequest(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  const host = request.headers.get('host');
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

// 幂等登出端点：路径为 /auth/admin/logout。
// 不能用 /api/admin/logout：生产 Nginx 的 location /api/ 会把所有 /api/* 统一转发给 backend_upstream，
// 这个 Next.js frontend 自己的 Route Handler 永远收不到请求，实测会经 backend 兜底为 404。
// 也不用 /admin/* 前缀：会落入 proxy.ts 的 '/admin/:path*' matcher，被"未登录 -> 404"的保护逻辑拦截。
// /auth/admin/logout 同时避开这两条规则，自动落入 Nginx 的 location / 转发给 frontend，无需改动 Nginx。
// 无论 Cookie 是否存在都返回 204，重复调用安全。不做会话有效性校验（校验交给 getCurrentAdmin），
// 只负责"删掉本地这份 Cookie"这一件事，不改变后端认证协议。
export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return new NextResponse(null, { status: 403 });
  }
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  return new NextResponse(null, { status: 204 });
}
