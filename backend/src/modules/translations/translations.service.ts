import type { PrismaClient } from '@prisma/client';
import type { SupportedLocale } from './translations.schema.js';

/** 拍平成 { key: value } 给前台/后台直接用，没有译文覆盖的 key 不会出现在结果里 */
export async function getTranslationMap(prisma: PrismaClient, locale: SupportedLocale): Promise<Record<string, string>> {
  const rows = await prisma.translation.findMany({ where: { locale }, select: { key: true, value: true } });
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

/**
 * value 为空字符串时删除这一行（回退英文原文），不写入空值行；
 * 非空则 upsert。返回实际发生变化的条目数，供审计日志摘要使用。
 */
export async function upsertTranslations(
  prisma: PrismaClient,
  locale: SupportedLocale,
  entries: { key: string; value: string }[],
): Promise<{ upserted: number; cleared: number }> {
  let upserted = 0;
  let cleared = 0;
  for (const entry of entries) {
    const trimmed = entry.value.trim();
    if (trimmed === '') {
      const result = await prisma.translation.deleteMany({ where: { locale, key: entry.key } });
      if (result.count > 0) cleared += 1;
    } else {
      await prisma.translation.upsert({
        where: { locale_key: { locale, key: entry.key } },
        create: { locale, key: entry.key, value: trimmed },
        update: { value: trimmed },
      });
      upserted += 1;
    }
  }
  return { upserted, cleared };
}
