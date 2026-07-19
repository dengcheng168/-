import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME } from '@/config/constants';

/**
 * 通用的后台 API 代理：供少数需要在客户端直接发起请求的交互使用
 * （例如删除媒体前先查用量、再弹确认框），同样是为了转发 Cookie（见 media/upload/route.ts 注释）。
 * 大多数场景应优先使用 Server Action + adminFetch，这个通用代理只用于必须在客户端交互的场景。
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

  const res = await fetch(targetUrl, {
    method: request.method,
    headers: {
      'Content-Type': 'application/json',
      Cookie: `${ADMIN_COOKIE_NAME}=${token}`,
    },
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text(),
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
