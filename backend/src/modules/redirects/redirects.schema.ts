import { z } from 'zod';
import { isRedirectPath } from './redirect-path.js';

const pathSchema = z.string().refine(isRedirectPath, '请输入站内路径，例如 /products/ro，不支持外部网址、查询参数或管理路径');

export const createRedirectSchema = z.object({
  fromPath: pathSchema,
  toPath: pathSchema,
  statusCode: z.union([z.literal(301), z.literal(302)]).optional(),
});

export const updateRedirectSchema = createRedirectSchema.partial();

export type CreateRedirectInput = z.infer<typeof createRedirectSchema>;
export type UpdateRedirectInput = z.infer<typeof updateRedirectSchema>;
