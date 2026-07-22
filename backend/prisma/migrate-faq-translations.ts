/**
 * 一次性结构迁移：把旧的通用 Translation 表里的 faq.{id}.question / faq.{id}.answer
 * key-value 内容迁移进新的 FaqTranslation 表（正式事实源，见 backend/prisma/schema.prisma）。
 *
 * 规则：
 * - 只读旧 Translation 表，不修改、不删除（faq.* key 迁移后继续留在表里，作为兼容回退，
 *   见 frontend/src/lib/i18n/faq-source.ts 的 resolveFaqContent）；
 * - 已经存在 FaqTranslation(es) 记录的一律跳过，绝不覆盖——不管是本脚本上次运行创建的，
 *   还是管理员在后台手动编辑过的；
 * - 旧数据里 question/answer 只有一个有内容、另一个缺失或纯空格的，视为"不完整翻译"，
 *   不自动创建/发布，计入"跳过"；
 * - 旧 key 对应的 faqId 在 Faq 主表里已经不存在（比如后来被删除）的，计入"无法匹配"；
 * - 支持 --dry-run，只打印统计不写库；
 * - 逐条 upsert（unique 约束在 faqId+locale 上，本来就具备幂等性），可以安全重复执行。
 *
 * 运行：
 *   npx tsx prisma/migrate-faq-translations.ts
 *   npx tsx prisma/migrate-faq-translations.ts --dry-run
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DRY_RUN = process.argv.includes('--dry-run');
const LOCALE = 'es';

const KEY_PATTERN = /^faq\.(\d+)\.(question|answer)$/;

function nonEmpty(value: string | undefined): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}

async function main() {
  console.log(`开始迁移旧 FAQ 翻译${DRY_RUN ? '（--dry-run，不写库）' : ''}...`);

  const legacyRows = await prisma.translation.findMany({
    where: { locale: LOCALE, key: { startsWith: 'faq.' } },
  });

  // 按 faqId 分组，同一个 faq 的 question/answer 两个 key 合并成一条待迁移记录
  const grouped = new Map<number, { question?: string; answer?: string }>();
  for (const row of legacyRows) {
    const match = row.key.match(KEY_PATTERN);
    if (!match) continue; // faq.* 命名空间下其它不认识的 key，忽略，不计入统计
    const faqId = Number(match[1]);
    const field = match[2] as 'question' | 'answer';
    const value = nonEmpty(row.value);
    if (!value) continue; // 空字符串/纯空格视为没有内容
    const entry = grouped.get(faqId) ?? {};
    entry[field] = value;
    grouped.set(faqId, entry);
  }

  const totalLegacy = grouped.size;
  let alreadyExists = 0;
  let migrated = 0;
  let skippedIncomplete = 0;
  let unmatched = 0;
  let failed = 0;

  for (const [faqId, content] of grouped) {
    try {
      const faq = await prisma.faq.findUnique({ where: { id: faqId } });
      if (!faq) {
        unmatched++;
        console.log(`[unmatched] faq #${faqId} 在主表中不存在（可能已被删除）`);
        continue;
      }

      const existing = await prisma.faqTranslation.findUnique({
        where: { faqId_locale: { faqId, locale: LOCALE } },
      });
      if (existing) {
        alreadyExists++;
        console.log(`[already-exists] faq #${faqId} 已有 FaqTranslation(es)，跳过，不覆盖`);
        continue;
      }

      if (!content.question || !content.answer) {
        skippedIncomplete++;
        console.log(`[skipped] faq #${faqId} 旧数据不完整（question/answer 缺一个），不自动发布`);
        continue;
      }

      if (DRY_RUN) {
        migrated++;
        console.log(`[would-migrate] faq #${faqId}`);
        continue;
      }

      await prisma.faqTranslation.create({
        data: {
          faqId,
          locale: LOCALE,
          question: content.question,
          answer: content.answer,
          translationStatus: 'PUBLISHED',
        },
      });
      migrated++;
      console.log(`[migrated] faq #${faqId}`);
    } catch (err) {
      failed++;
      console.error(`[failed] faq #${faqId}`, err);
    }
  }

  console.log('');
  console.log('迁移结果汇总：');
  console.log(`  旧 FAQ 翻译总数：${totalLegacy}`);
  console.log(`  已存在新记录数量：${alreadyExists}`);
  console.log(`  新迁移数量：${migrated}`);
  console.log(`  跳过数量（不完整）：${skippedIncomplete}`);
  console.log(`  无法匹配数量：${unmatched}`);
  console.log(`  失败数量：${failed}`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
