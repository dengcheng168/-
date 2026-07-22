import { env } from '../config/env.js';

export interface RevalidateSiteConfigResult {
  ok: boolean;
  /** 尽力而为的诊断信息，绝不包含 REVALIDATE_SECRET 本身 */
  message?: string;
}

/**
 * 后台保存正式站点域名后，通知前端 Next.js 服务清掉 site-config 相关缓存，让下一次请求
 * canonical/hreflang/Sitemap/Robots/JSON-LD 立即用上新域名，不需要重新执行 docker compose build。
 *
 * 尽力而为：网络请求失败或前端返回非 2xx 都只记录、不抛出——域名本身已经写入数据库，
 * 不应该因为一次缓存刷新调用失败就让整个"保存"操作报错回滚（见需求「十五」第12条）。
 * 调用方应该把这里返回的 ok:false 转成"配置已保存，缓存刷新失败，可手动重试"这样的提示，
 * 而不是笼统地报"保存失败"。
 */
export async function revalidateSiteConfig(): Promise<RevalidateSiteConfigResult> {
  try {
    const res = await fetch(`${env.FRONTEND_BASE_URL}/api/internal/revalidate-site-config`, {
      method: 'POST',
      headers: env.REVALIDATE_SECRET ? { 'x-revalidate-secret': env.REVALIDATE_SECRET } : {},
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return { ok: false, message: `前端缓存刷新接口返回 ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `前端缓存刷新调用失败：${message}` };
  }
}
