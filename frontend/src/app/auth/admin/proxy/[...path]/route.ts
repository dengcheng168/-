import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME } from '@/config/constants';

/**
 * 通用的后台 API 代理：供少数需要在客户端直接发起请求的交互使用
 * （例如删除媒体前先查用量、再弹确认框），同样是为了转发 Cookie（见 media/upload/route.ts 注释）。
 * 大多数场景应优先使用 Server Action + adminFetch，这个通用代理只用于必须在客户端交互的场景。
 *
 * 路径特意放在 /auth/admin/ 而不是 /api/admin/：生产 Nginx 的 location /api/ 会把所有 /api/*
 * 统一转发给 backend_upstream，这个 Next.js frontend 自己的 Route Handler 永远收不到请求（实测
 * DELETE /api/admin/proxy/media/:id 会被 Nginx 直接转发到 backend，backend 收到的是原封不动的
 * "/api/admin/proxy/media/:id" 这个路径，它当然没有这条路由，报 404——跟 /auth/admin/logout 那次
 * 是同一类问题）。/auth/admin/proxy/... 同时避开 Nginx 的 location /api/ 和 proxy.ts 的
 * '/admin/:path*' matcher，自动落入 Nginx 的 location / 转发给 frontend，无需改动 Nginx。
 */
async function proxy(request: Request, path: string[]) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ success: false, error: { message: '未登录' } }, { status: 401 });
  }

  const internalBase = process.env.INTERNAL_API_BASE_URL ?? 'http://localhost:4000';
  const { search } = new URL(request.url);
  const targetUrl = `${internalBase}/api/admin/${path.join('/')}${search}`;

  const hasBody = !['GET', 'HEAD'].includes(request.method) ? await request.text() : undefined;

  const res = await fetch(targetUrl, {
    method: request.method,
    headers: {
      Cookie: `${ADMIN_COOKIE_NAME}=${token}`,
      // 只有实际带 body 时才声明 JSON content-type——DELETE 等无 body 请求如果强行声明会被
      // 后端 Fastify 判定为 "Content-Type: application/json 但 body 为空" 而报 400 错误。
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    },
    body: hasBody || undefined,
  });

  const body = await res.text();
  return new NextResponse(body, { status: res.status, headers: { 'Content-Type': 'application/json' } });
}

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await params).path);
}
export async function DELETE(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await params).path);
}
