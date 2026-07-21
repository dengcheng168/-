import { z } from 'zod';
import { SUPPORTED_LOCALES } from '../translations/translations.schema.js';

export const createFaqSchema = z.object({
  question: z.string().min(1, '问题不能为空'),
  answer: z.string().min(1, '答案不能为空'),
  category: z.string().optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
});

export const updateFaqSchema = createFaqSchema.partial();

export const reorderSchema = z.object({
  items: z.array(z.object({ id: z.number().int(), sortOrder: z.number().int() })),
});

export const faqListQuerySchema = z.object({
  locale: z.enum(SUPPORTED_LOCALES).optional(),
});

export const upsertFaqTranslationSchema = z.object({
  question: z.string().optional(),
  answer: z.string().optional(),
  translationStatus: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});

export type CreateFaqInput = z.infer<typeof createFaqSchema>;
export type UpdateFaqInput = z.infer<typeof updateFaqSchema>;
export type UpsertFaqTranslationInput = z.infer<typeof upsertFaqTranslationSchema>;
