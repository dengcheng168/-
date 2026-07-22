import 'server-only';
import { cache } from 'react';
import { apiFetch } from '@/lib/api/client';
import { resolveSiteBaseUrl, type ResolvedSiteBaseUrl } from './resolve-site-base-url';

export type { SiteBaseUrlSource, ResolvedSiteBaseUrl } from './resolve-site-base-url';

async function fetchDatabaseSiteBaseUrl(): Promise<string | null> {
  try {
    const { data } = await apiFetch<{ siteBaseUrl: string | null }>('/settings/public', {
      revalidate: 300,
      // 独立于 lib/api/settings.ts 的 getPublicSettings()（那份走 'settings' tag，Header/Footer/
      // Hero 等大量组件在用）：这里用统一的 'site-config' tag，后台保存域名后只需要
      // revalidateTag('site-config') 就能精确刷新，不用连带刷新所有 'settings' 消费者。
      tags: ['settings', 'site-config'],
    });
    return data.siteBaseUrl;
  } catch {
    return null;
  }
}

/**
 * 全站 SEO 绝对 URL（canonical/hreflang/sitemap/robots/Open Graph/JSON-LD）的唯一运行时读取入口，
 * 不允许任何页面/组件另外自己拼域名常量。优先级见 Runtime Site Domain Configuration 需求「八」，
 * 具体的四层优先级判断逻辑是纯函数，见 resolve-site-base-url.ts（可单独单元测试）。
 *
 * 生产环境如果四层都没有可用值，不静默生成 localhost 的 SEO 地址——直接抛出，让配置缺失在
 * 构建/首次请求时就暴露出来，而不是悄悄把 canonical/sitemap 写成 localhost 上线。
 *
 * 用 React cache() 包一层：同一次请求/渲染里被 metadataBase、canonical、hreflang、JSON-LD 等
 * 多处重复调用时只会真正发一次 fetch，不是靠调用方自己传参数复用。
 */
export const getSiteBaseUrl = cache(async (): Promise<ResolvedSiteBaseUrl> => {
  const dbValue = await fetchDatabaseSiteBaseUrl();
  const resolved = resolveSiteBaseUrl(dbValue, {
    SITE_URL: process.env.SITE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    isDevelopment: process.env.NODE_ENV !== 'production',
  });

  if (resolved) return resolved;

  console.error(
    '[getSiteBaseUrl] 生产环境未配置任何有效的站点域名来源（数据库 siteBaseUrl / SITE_URL / ' +
      'NEXT_PUBLIC_SITE_URL 均无效或缺失），拒绝生成 localhost SEO 地址。请在后台 SEO 设置或 ' +
      'SITE_URL 环境变量中配置正式域名。',
  );
  throw new Error(
    'Site base URL is not configured for production. Configure it in Admin > SEO settings, or set the SITE_URL environment variable.',
  );
});
