import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME } from '@/config/constants';

/** CSV 导出同样需要经服务端代理转发 Cookie（原因见 media/upload/route.ts 的注释）*/
export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ success: false, error: { message: '未登录' } }, { status: 401 });
  }

  const { search } = new URL(request.url);
  const internalBase = process.env.INTERNAL_API_BASE_URL ?? 'http://localhost:4000';
  const res = await fetch(`${internalBase}/api/admin/inquiries/export.csv${search}`, {
    headers: { Cookie: `${ADMIN_COOKIE_NAME}=${token}` },
  });

  const csv = await res.text();
  return new NextResponse(csv, {
    status: res.status,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="inquiries.csv"',
    },
  });
}
