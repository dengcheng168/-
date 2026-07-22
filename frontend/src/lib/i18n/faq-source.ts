import type { Faq } from '@/types/content';

export interface FaqTranslationOverlay {
  question?: string | null;
  answer?: string | null;
}

function nonEmpty(value: string | null | undefined): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}

/**
 * FAQ 的西语内容目前有两个可能来源：
 * 1. FaqTranslation 表（新的正式事实源，每条 FAQ 一行，后台 Español 标签页写这里）
 * 2. 旧的通用 Translation 表（faq.{id}.question / faq.{id}.answer key，迁移前留下的兼容数据，
 *    见 backend/prisma/migrate-faq-translations.ts；已经迁移过的内容这里通常会是空的）
 *
 * 优先级：FaqTranslation 已发布内容 > 旧 Translation 表内容 > 英文原文。
 * 空字符串/纯空格视为"没有译文"，不会覆盖更高优先级或英文原文。
 *
 * 纯函数，不依赖网络请求，方便单独单元测试。
 */
export function resolveFaqContent(
  faq: Faq,
  faqTranslation: FaqTranslationOverlay | null | undefined,
  legacyTranslationMap: Record<string, string>,
): Faq {
  const question =
    nonEmpty(faqTranslation?.question) ?? nonEmpty(legacyTranslationMap[`faq.${faq.id}.question`]) ?? faq.question;
  const answer =
    nonEmpty(faqTranslation?.answer) ?? nonEmpty(legacyTranslationMap[`faq.${faq.id}.answer`]) ?? faq.answer;
  return { ...faq, question, answer };
}

export function resolveFaqListContent(
  faqs: (Faq & { translation?: FaqTranslationOverlay | null })[],
  legacyTranslationMap: Record<string, string>,
): Faq[] {
  return faqs.map((faq) => {
    const { translation, ...base } = faq;
    return resolveFaqContent(base as Faq, translation, legacyTranslationMap);
  });
}
