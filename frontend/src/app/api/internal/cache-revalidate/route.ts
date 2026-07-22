import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getInternalSecret } from '@/lib/internal-secret';

/**
 * 只给同一进程内的定时器（见 instrumentation.ts）调用，靠请求头里的进程内密钥挡掉外部访问。
 * revalidatePath 官方只保证在 Server Action / Route Handler 里可用，
 * 定时器不能直接调它，所以走"定时器发内网请求 -> 这个路由真正调用 revalidatePath"这条路径。
 */
export async function POST(request: Request) {
  const secret = request.headers.get('x-internal-secret');
  if (secret !== getInternalSecret()) {
    return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
  }

  revalidatePath('/', 'layout');
  return NextResponse.json({ success: true, revalidatedAt: new Date().toISOString() });
}
