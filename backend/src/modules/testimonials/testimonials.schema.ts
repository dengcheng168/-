import { z } from 'zod';

export const createTestimonialSchema = z.object({
  authorName: z.string().min(1, '姓名不能为空'),
  authorTitle: z.string().optional(),
  companyName: z.string().optional(),
  country: z.string().optional(),
  avatarUrl: z.string().optional(),
  quote: z.string().min(1, '评价内容不能为空'),
  rating: z.number().int().min(1).max(5).optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
});

export const updateTestimonialSchema = createTestimonialSchema.partial();

export const reorderSchema = z.object({
  items: z.array(z.object({ id: z.number().int(), sortOrder: z.number().int() })),
});

export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>;
export type UpdateTestimonialInput = z.infer<typeof updateTestimonialSchema>;
