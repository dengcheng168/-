import { getInternalSecret } from '@/lib/internal-secret';

const DEFAULT_INTERVAL_HOURS = 24;

/**
 * 服务器启动时自动挂一个定时器，定期清理全站缓存（等价于后台"缓存管理"页那个手动按钮），
 * 不需要管理员手动点。间隔可用 CACHE_AUTO_CLEAR_INTERVAL_HOURS 环境变量调整，默认 24 小时。
 *
 * register() 按 Next.js 文档保证每个服务器进程只会调用一次（不会随每次请求或热更新重复触发），
 * 但这里仍然用 globalThis 做一次保底去重——万一某个 Next.js 版本/部署方式下被多次调用，
 * 也不会叠加出好几个定时器同时清缓存。
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'edge') return;

  const g = globalThis as typeof globalThis & { __cacheAutoClearStarted?: boolean };
  if (g.__cacheAutoClearStarted) return;
  g.__cacheAutoClearStarted = true;

  const intervalHours = Number(process.env.CACHE_AUTO_CLEAR_INTERVAL_HOURS) || DEFAULT_INTERVAL_HOURS;
  const intervalMs = intervalHours * 60 * 60 * 1000;
  const port = process.env.PORT ?? '3000';

  setInterval(() => {
    fetch(`http://localhost:${port}/api/internal/cache-revalidate`, {
      method: 'POST',
      headers: { 'x-internal-secret': getInternalSecret() },
    })
      .then((res) => {
        if (!res.ok) console.error(`[定期清理缓存] 触发失败，状态码 ${res.status}`);
      })
      .catch((err) => {
        console.error('[定期清理缓存] 触发失败', err);
      });
  }, intervalMs).unref();

  console.log(`[定期清理缓存] 已启动，每 ${intervalHours} 小时自动清理一次全站缓存`);
}
