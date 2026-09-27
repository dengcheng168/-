import { z } from 'zod';
import { paginationQuerySchema } from '../../lib/pagination.js';

export const recordPageViewSchema = z.object({
  path: z.string().min(1).max(500),
});

export type RecordPageViewInput = z.infer<typeof recordPageViewSchema>;

export const pageViewListQuerySchema = paginationQuerySchema.extend({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
}).refine(({ from, to }) => !from || !to || from < to, {
  message: 'from must be earlier than to',
});

export type PageViewListQuery = z.infer<typeof pageViewListQuerySchema>;
