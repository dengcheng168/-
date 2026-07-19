import { z } from 'zod';

const specItemSchema = z.object({ label: z.string(), value: z.string() });
const imageItemSchema = z.object({ url: z.string(), alt: z.string().optional() });
const applicationItemSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(1, '产品名称不能为空'),
  slug: z.string().min(1).optional(),
  sku: z.string().optional(),
  categoryId: z.number().int(),
  shortDescription: z.string().optional(),
  description: z.string().min(1, '产品详细描述不能为空'),
  mainImage: z.string().min(1, '请上传主图'),
  galleryImages: z.array(imageItemSchema).default([]),
  specs: z.array(specItemSchema).default([]),
  features: z.array(z.union([z.string(), z.object({ title: z.string(), description: z.string().optional() })])).default([]),
  applications: z.array(applicationItemSchema).default([]),
  packagingInfo: z.string().optional(),
  moq: z.string().optional(),
  oemOdmSupport: z.boolean().optional(),
  specSheetUrl: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  featured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  ogImage: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const reorderSchema = z.object({
  items: z.array(z.object({ id: z.number().int(), sortOrder: z.number().int() })),
});

export const bulkStatusSchema = z.object({
  ids: z.array(z.number().int()).min(1),
  status: z.enum(['DRAFT', 'PUBLISHED']),
});

export const productListQuerySchema = z.object({
  category: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  q: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
