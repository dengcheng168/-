import { z } from 'zod';
import { SUPPORTED_LOCALES } from '../translations/translations.schema.js';

export const createFactoryGalleryItemSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
});

export const updateFactoryGalleryItemSchema = createFactoryGalleryItemSchema.partial();

export const reorderSchema = z.object({
  items: z.array(z.object({ id: z.number().int(), sortOrder: z.number().int() })),
});

export const factoryGalleryListQuerySchema = z.object({
  locale: z.enum(SUPPORTED_LOCALES).optional(),
});

export const upsertFactoryGalleryItemTranslationSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  translationStatus: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});

export type CreateFactoryGalleryItemInput = z.infer<typeof createFactoryGalleryItemSchema>;
export type UpdateFactoryGalleryItemInput = z.infer<typeof updateFactoryGalleryItemSchema>;
export type UpsertFactoryGalleryItemTranslationInput = z.infer<typeof upsertFactoryGalleryItemTranslationSchema>;
