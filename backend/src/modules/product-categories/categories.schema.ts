import { z } from 'zod';
import { SUPPORTED_LOCALES } from '../translations/translations.schema.js';

export const categoryDetailQuerySchema = z.object({
  locale: z.enum(SUPPORTED_LOCALES).optional(),
});

export const upsertCategoryTranslationSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  translationStatus: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});

export type UpsertCategoryTranslationInput = z.infer<typeof upsertCategoryTranslationSchema>;

export const createCategorySchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const reorderSchema = z.object({
  items: z.array(z.object({ id: z.number().int(), sortOrder: z.number().int() })),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
