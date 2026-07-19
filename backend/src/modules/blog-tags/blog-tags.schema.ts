import { z } from 'zod';

export const createBlogTagSchema = z.object({
  name: z.string().min(1, '标签名称不能为空'),
  slug: z.string().min(1).optional(),
});

export type CreateBlogTagInput = z.infer<typeof createBlogTagSchema>;
