import { z } from 'zod';

export const createRedirectSchema = z.object({
  fromPath: z.string().min(1, '来源路径不能为空'),
  toPath: z.string().min(1, '目标路径不能为空'),
  statusCode: z.union([z.literal(301), z.literal(302)]).optional(),
});

export const updateRedirectSchema = createRedirectSchema.partial();

export type CreateRedirectInput = z.infer<typeof createRedirectSchema>;
export type UpdateRedirectInput = z.infer<typeof updateRedirectSchema>;
