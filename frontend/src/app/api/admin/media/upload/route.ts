import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME } from '@/config/constants';

/**
 * 图片上传的服务端代理：浏览器直接上传到后端会因为跨源丢失 wp_session Cookie
 * （该 Cookie 种在前端域下），所以先经过这个同源的 Route Handler 转发，
 * 由服务端手动把 Cookie 附加到发往后端的请求上。
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ success: false, error: { message: '未登录', code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const incomingFormData = await request.formData();

  const internalBase = process.env.INTERNAL_API_BASE_URL ?? 'http://localhost:4000';
  const res = await fetch(`${internalBase}/api/admin/media/upload`, {
    method: 'POST',
    headers: { Cookie: `${ADMIN_COOKIE_NAME}=${token}` },
    body: incomingFormData,
  });

  const body = await res.json();
  return NextResponse.json(body, { status: res.status });
}
