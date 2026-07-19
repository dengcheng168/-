import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME } from '@/config/constants';

/**
 * 乐观鉴权检查：只判断 Cookie 是否存在，不做签名校验（校验放在 lib/auth/session.ts 的
 * getCurrentAdmin() 里，由 (dashboard)/layout.tsx 在每次渲染时向后端验证）。
 * Proxy 不适合做完整的会话校验，这里只负责把明显未登录的请求提前拦下。
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    const hasSession = request.cookies.has(ADMIN_COOKIE_NAME);
    if (!hasSession) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
