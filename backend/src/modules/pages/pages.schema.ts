import { z } from 'zod';

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

export type UpdatePageInput = z.infer<typeof updatePageSchema>;
