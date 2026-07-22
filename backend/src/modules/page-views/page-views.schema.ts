import { z } from 'zod';

export const recordPageViewSchema = z.object({
  path: z.string().min(1).max(500),
});

export type RecordPageViewInput = z.infer<typeof recordPageViewSchema>;
