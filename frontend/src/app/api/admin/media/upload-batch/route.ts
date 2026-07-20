import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME } from '@/config/constants';

/** 批量上传的服务端代理，转发 Cookie 的原因同 media/upload/route.ts */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ success: false, error: { message: '未登录', code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const incomingFormData = await request.formData();

  const internalBase = process.env.INTERNAL_API_BASE_URL ?? 'http://localhost:4000';
  const res = await fetch(`${internalBase}/api/admin/media/upload-batch`, {
    method: 'POST',
    headers: { Cookie: `${ADMIN_COOKIE_NAME}=${token}` },
    body: incomingFormData,
  });

  const body = await res.json();
  return NextResponse.json(body, { status: res.status });
}
