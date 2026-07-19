import { z } from 'zod';

export const createBlogCategorySchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
});

export const updateBlogCategorySchema = createBlogCategorySchema.partial();

export type CreateBlogCategoryInput = z.infer<typeof createBlogCategorySchema>;
export type UpdateBlogCategoryInput = z.infer<typeof updateBlogCategorySchema>;
