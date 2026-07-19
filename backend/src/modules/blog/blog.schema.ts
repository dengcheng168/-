import { z } from 'zod';

export const createBlogPostSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  slug: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  body: z.string().min(1, '正文不能为空'),
  coverImage: z.string().optional(),
  categoryId: z.number().int(),
  authorName: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  tagIds: z.array(z.number().int()).default([]),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

export const blogListQuerySchema = z.object({
  category: z.string().optional(),
  tag: z.string().optional(),
  q: z.string().optional(),
});

export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;
