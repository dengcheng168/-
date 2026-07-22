import { z } from 'zod';
import { SUPPORTED_LOCALES } from '../translations/translations.schema.js';

export const updatePageSchema = z.object({
  title: z.string().min(1).optional(),
  bodyHtml: z.string().optional(),
  sections: z.unknown().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  ogImage: z.string().optional(),
  heroImage: z.string().optional(),
  heroImageMobile: z.string().optional(),
});

export const pageDetailQuerySchema = z.object({
  locale: z.enum(SUPPORTED_LOCALES).optional(),
});

/** sections 整段 JSON 覆盖——结构因页面而异，不逐字段拆分翻译 */
export const upsertPageTranslationSchema = z.object({
  title: z.string().optional(),
  bodyHtml: z.string().optional(),
  sections: z.unknown().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  translationStatus: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});

export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type UpsertPageTranslationInput = z.infer<typeof upsertPageTranslationSchema>;
