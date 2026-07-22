/**
 * 一次性、显式手动执行的回填脚本：如果当前运行环境里的 SITE_URL 或旧的
 * NEXT_PUBLIC_SITE_URL 是一个有效的 HTTPS 非 localhost 地址，把它写进
 * SiteSetting.siteBaseUrl，省得管理员手动在后台重新输入一遍已经在用的域名。
 *
 * 规则（见 Runtime Site Domain Configuration 需求「四、数据库字段 - 兼容回填」）：
 * - 只在 siteBaseUrl 为空（null）时写入，后台已有值一律不覆盖；
 * - 优先取 SITE_URL，其次取 NEXT_PUBLIC_SITE_URL（兼容旧构建时变量）；
 * - localhost / 127.0.0.1 / 内网 IP 一律不写入（不管来自哪个环境变量）；
 * - 支持 --dry-run，只打印将要写入的来源和值，不写库；
 * - 幂等：重复执行时如果上次已经写入过，这次会因为 siteBaseUrl 非空而跳过；
 * - 不在脚本里硬编码任何生产域名，值完全来自当前进程的环境变量。
 *
 * 决策逻辑本身在 src/lib/backfill-site-base-url-decision.ts 里是一个纯函数
 * （见 backend/test/backfill-site-base-url-decision.test.ts 的单元测试），这个文件
 * 只负责读库、调用决策函数、按结果写库/打印，保持脚本本身尽量薄。
 *
 * 运行：
 *   npx tsx prisma/backfill-site-base-url.ts --dry-run
 *   npx tsx prisma/backfill-site-base-url.ts
 */
import { PrismaClient } from '@prisma/client';
import { decideSiteBaseUrlBackfill } from '../src/lib/backfill-site-base-url-decision.js';

const prisma = new PrismaClient();
const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  console.log(`开始回填正式站点域名${DRY_RUN ? '（--dry-run，不写库）' : ''}...`);

  const settings = await prisma.siteSetting.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
  const decision = decideSiteBaseUrlBackfill(settings.siteBaseUrl, {
    SITE_URL: process.env.SITE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });

  switch (decision.action) {
    case 'skip-existing':
      console.log(`[skipped] 后台已配置 siteBaseUrl = ${decision.existingValue}，不覆盖，脚本结束`);
      break;
    case 'skip-no-source':
      console.log('[skipped] 没有找到任何有效的生产域名来源（SITE_URL / NEXT_PUBLIC_SITE_URL 均无效或未设置），不写入');
      break;
    case 'write':
      console.log(`[found] 来源：${decision.source}，值：${decision.value}`);
      if (DRY_RUN) {
        console.log(`[would-write] 将写入 siteBaseUrl = ${decision.value}`);
      } else {
        await prisma.siteSetting.update({ where: { id: 1 }, data: { siteBaseUrl: decision.value } });
        console.log(`[written] siteBaseUrl 已写入 = ${decision.value}`);
      }
      break;
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
