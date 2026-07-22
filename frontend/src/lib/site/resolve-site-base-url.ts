export type SiteBaseUrlSource = 'DATABASE' | 'SITE_URL' | 'LEGACY_NEXT_PUBLIC_SITE_URL' | 'DEVELOPMENT_DEFAULT';

export interface ResolvedSiteBaseUrl {
  url: string;
  source: SiteBaseUrlSource;
}

export const DEV_DEFAULT_SITE_URL = 'http://localhost:3000';

export function isPlausibleAbsoluteUrl(value: string | null | undefined): value is string {
  if (typeof value !== 'string' || value.trim() === '') return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export interface ResolveSiteBaseUrlEnv {
  SITE_URL?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  isDevelopment: boolean;
}

/**
 * 纯函数：给定「数据库里的 siteBaseUrl 值」和「环境变量快照」，算出最终应该使用哪个站点根
 * 地址、来自哪一层。从 get-site-base-url.ts 里拆出来，是因为那个文件为了拿数据库值必须发
 * 一次网络请求（server-only），会让单元测试依赖真实后端；这个文件不发任何请求，可以直接
 * 单元测试四层优先级（数据库 > SITE_URL > 旧 NEXT_PUBLIC_SITE_URL 兼容 > 开发默认值）本身
 * 的正确性，见 resolve-site-base-url.test.ts。
 *
 * 生产环境（isDevelopment: false）如果四层都没有可用值，返回 null 而不是静默给出 localhost——
 * 调用方（get-site-base-url.ts）据此决定是否要 throw，让配置缺失在构建/首次请求时就暴露出来。
 */
/** 数据库值已经由 backend/src/lib/site-url.ts 规范化去掉末尾斜杠；环境变量是管理员手填的，
 * 不经过那层校验，这里补一次同样的规范化，避免 SITE_URL=https://x.com/ 这类值跟
 * toAbsolute() 拼接路径时产生 https://x.com//products 这种重复斜杠。 */
function stripTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

export function resolveSiteBaseUrl(dbValue: string | null | undefined, env: ResolveSiteBaseUrlEnv): ResolvedSiteBaseUrl | null {
  if (isPlausibleAbsoluteUrl(dbValue)) {
    return { url: stripTrailingSlash(dbValue.trim()), source: 'DATABASE' };
  }

  if (isPlausibleAbsoluteUrl(env.SITE_URL)) {
    return { url: stripTrailingSlash(env.SITE_URL.trim()), source: 'SITE_URL' };
  }

  if (isPlausibleAbsoluteUrl(env.NEXT_PUBLIC_SITE_URL)) {
    return { url: stripTrailingSlash(env.NEXT_PUBLIC_SITE_URL.trim()), source: 'LEGACY_NEXT_PUBLIC_SITE_URL' };
  }

  if (env.isDevelopment) {
    return { url: DEV_DEFAULT_SITE_URL, source: 'DEVELOPMENT_DEFAULT' };
  }

  return null;
}
