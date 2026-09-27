import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME, ADMIN_LOGIN_PATH } from '@/config/constants';

/**
 * 乐观鉴权检查：只判断 Cookie 是否存在，不做签名校验（校验放在 lib/auth/session.ts 的
 * getCurrentAdmin() 里，由 (dashboard)/layout.tsx 在每次渲染时向后端验证）。
 * Proxy 不适合做完整的会话校验，这里只负责把明显未登录的请求提前拦下。
 *
 * 登录页地址刻意迁到站点根目录下的一个随机路径（不再是可预测的 /admin/login），
 * 未登录时访问 /admin/** 直接返回 404，而不是跳转到登录页——避免通过跳转暴露登录页地址。
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const hasSession = request.cookies.has(ADMIN_COOKIE_NAME);
    if (!hasSession) {
      return new NextResponse(null, { status: 404 });
    }
    return NextResponse.next();
  }

  if (!['GET', 'HEAD'].includes(request.method) || pathname === ADMIN_LOGIN_PATH || /^\/auth(?:\/|$)/.test(pathname)) return NextResponse.next();
  try {
    const base = process.env.INTERNAL_API_BASE_URL ?? 'http://localhost:4000';
    const response = await fetch(`${base}/api/redirects/resolve?path=${encodeURIComponent(pathname)}`, {
      cache: 'no-store', signal: AbortSignal.timeout(1000),
    });
    if (response.ok) {
      const body = await response.json();
      const rule = body.success && body.data;
      if (rule && typeof rule.toPath === 'string' && /^\/[A-Za-z0-9/_.-]*$/.test(rule.toPath)
        && !rule.toPath.includes('//') && rule.toPath !== pathname && [301, 302].includes(rule.statusCode)) {
        const target = new URL(rule.toPath, request.url);
        target.search = request.nextUrl.search;
        if (target.origin === request.nextUrl.origin) return NextResponse.redirect(target, rule.statusCode);
      }
    }
  } catch {
    // A redirect lookup outage must not take the public website offline.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/((?!api(?:/|$)|_next(?:/|$)|uploads(?:/|$)|.*\\.(?:ico|png|jpg|jpeg|webp|svg|css|js|woff2?|xml|txt)$).*)'],
};
