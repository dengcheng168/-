import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '密码不能为空'),
});

export type LoginInput = z.infer<typeof loginSchema>;
