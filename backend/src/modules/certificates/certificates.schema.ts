import { z } from 'zod';

export const createCertificateSchema = z.object({
  name: z.string().min(1, '证书名称不能为空'),
  certType: z.string().optional(),
  certNumber: z.string().optional(),
  issuingAuthority: z.string().optional(),
  issueDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  imageUrl: z.string().min(1, '请上传证书图片'),
  pdfUrl: z.string().optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
});

export const updateCertificateSchema = createCertificateSchema.partial();

export const reorderSchema = z.object({
  items: z.array(z.object({ id: z.number().int(), sortOrder: z.number().int() })),
});

export type CreateCertificateInput = z.infer<typeof createCertificateSchema>;
export type UpdateCertificateInput = z.infer<typeof updateCertificateSchema>;
