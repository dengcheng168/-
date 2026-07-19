import { z } from 'zod';

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
