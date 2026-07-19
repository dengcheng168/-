import { z } from 'zod';

export const createNavItemSchema = z.object({
  label: z.string().min(1, '菜单名称不能为空'),
  url: z.string().min(1, '链接不能为空'),
  sortOrder: z.number().int().optional(),
  visible: z.boolean().optional(),
  openInNewTab: z.boolean().optional(),
  parentId: z.number().int().nullable().optional(),
});

export const updateNavItemSchema = createNavItemSchema.partial();

export const reorderSchema = z.object({
  items: z.array(z.object({ id: z.number().int(), sortOrder: z.number().int() })),
});

export type CreateNavItemInput = z.infer<typeof createNavItemSchema>;
export type UpdateNavItemInput = z.infer<typeof updateNavItemSchema>;
