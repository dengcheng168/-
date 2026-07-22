import { z } from 'zod';
import { ADMIN_ROLES } from '../../config/roles.js';

export const createAdminUserSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(8, '密码至少 8 位'),
  name: z.string().optional(),
  role: z.enum(ADMIN_ROLES),
});

export const updateAdminUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('邮箱格式不正确').optional(),
  role: z.enum(ADMIN_ROLES).optional(),
  isActive: z.boolean().optional(),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, '密码至少 8 位'),
});

export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>;
export type UpdateAdminUserInput = z.infer<typeof updateAdminUserSchema>;
