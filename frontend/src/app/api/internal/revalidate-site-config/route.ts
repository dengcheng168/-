import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * 后台保存正式站点域名后，后端服务器到服务器调用这个接口，让 canonical/hreflang/Sitemap/
 * Robots/JSON-LD 立即用上新域名，不需要重新执行 docker compose build。
 *
 * 跟 /api/internal/cache-revalidate（同进程定时器自调用，走随机生成的 getInternalSecret()）
 * 是两条独立的路径：这里是跨进程/跨容器调用（backend -> frontend），必须用一个双方都显式配置、
 * 持久化的共享密钥（REVALIDATE_SECRET 环境变量），不能用那个只活在单进程 globalThis 里的随机值
 * ——backend 进程根本不可能知道 frontend 进程随机生成的那个 UUID。
 *
 * revalidateTag 用 { expire: 0 } 而不是 updateTag：这里是 Route Handler，不是 Server Action，
 * updateTag 明确只能在 Server Action 里调用；{ expire: 0 } 是 Next.js 文档里给"外部系统调用
 * Route Handler、需要立即过期"这个场景的推荐写法，语义上等价于让下一次访问立即拿到新数据，
 * 而不是 profile="max" 的 stale-while-revalidate（那样管理员保存完域名可能还要再访问一次才生效）。
 */
export async function POST(request: Request) {
  const secret = request.headers.get('x-revalidate-secret');
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
  }

  revalidateTag('site-config', { expire: 0 });
  revalidatePath('/', 'layout');

  return NextResponse.json({ success: true, revalidatedAt: new Date().toISOString() });
}
