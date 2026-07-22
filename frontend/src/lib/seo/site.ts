import 'server-only';
import { getSiteBaseUrl } from '@/lib/site/get-site-base-url';

/**
 * 全站生成绝对 URL 唯一入口，底层读取见 lib/site/get-site-base-url.ts 的运行时优先级
 * （数据库 siteBaseUrl > SITE_URL 环境变量 > 旧 NEXT_PUBLIC_SITE_URL 兼容 > 开发默认值）。
 * 从同步函数改成异步是本次 Runtime Site Domain Configuration 的核心改动之一：
 * 所有调用方（canonical/hreflang/sitemap/robots/JSON-LD/Open Graph）都需要 await。
 */
export async function getSiteUrl(): Promise<string> {
  const resolved = await getSiteBaseUrl();
  return resolved.url;
}

export async function absoluteUrl(path: string): Promise<string> {
  const base = await getSiteUrl();
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
