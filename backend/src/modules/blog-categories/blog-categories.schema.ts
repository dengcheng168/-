import { z } from 'zod';
import { SUPPORTED_LOCALES } from '../translations/translations.schema.js';

export const createBlogCategorySchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
});

export const updateBlogCategorySchema = createBlogCategorySchema.partial();

export const blogCategoryListQuerySchema = z.object({
  locale: z.enum(SUPPORTED_LOCALES).optional(),
});

export const upsertBlogCategoryTranslationSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  translationStatus: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});

export type CreateBlogCategoryInput = z.infer<typeof createBlogCategorySchema>;
export type UpdateBlogCategoryInput = z.infer<typeof updateBlogCategorySchema>;
export type UpsertBlogCategoryTranslationInput = z.infer<typeof upsertBlogCategoryTranslationSchema>;
