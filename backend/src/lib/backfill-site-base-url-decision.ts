import { validateSiteBaseUrl } from './site-url.js';

export type SiteBaseUrlBackfillDecision =
  | { action: 'skip-existing'; existingValue: string }
  | { action: 'write'; source: 'SITE_URL' | 'NEXT_PUBLIC_SITE_URL'; value: string }
  | { action: 'skip-no-source' };

/**
 * 纯函数，把「回填脚本该做什么」这个决策从 backend/prisma/backfill-site-base-url.ts 的
 * main() 里拆出来，方便直接单元测试，不需要真的起一个 PrismaClient/数据库。
 * 规则见 prisma/backfill-site-base-url.ts 顶部注释。
 */
export function decideSiteBaseUrlBackfill(
  currentValue: string | null,
  env: { SITE_URL?: string; NEXT_PUBLIC_SITE_URL?: string },
): SiteBaseUrlBackfillDecision {
  if (currentValue) {
    return { action: 'skip-existing', existingValue: currentValue };
  }

  const candidates: { source: 'SITE_URL' | 'NEXT_PUBLIC_SITE_URL'; raw: string | undefined }[] = [
    { source: 'SITE_URL', raw: env.SITE_URL },
    { source: 'NEXT_PUBLIC_SITE_URL', raw: env.NEXT_PUBLIC_SITE_URL },
  ];

  for (const candidate of candidates) {
    if (!candidate.raw) continue;
    // 回填脚本一律按生产规则校验（allowLocalhost: false）：localhost 无论来自哪个环境变量都不写入
    const result = validateSiteBaseUrl(candidate.raw, { allowLocalhost: false });
    if (!result.ok || !result.value) continue;
    return { action: 'write', source: candidate.source, value: result.value };
  }

  return { action: 'skip-no-source' };
}
