import type { PrismaClient } from '@prisma/client';
import type { PaginationQuery } from '../../lib/pagination.js';
import { toSkipTake } from '../../lib/pagination.js';
import type { RecordPageViewInput } from './page-views.schema.js';

export function recordPageView(prisma: PrismaClient, input: RecordPageViewInput) {
  return prisma.pageView.create({ data: { path: input.path } });
}

/** 只给后台"数据概览"用来复用现有 countOf(path) 走 meta.total 的模式，不需要展示每一行的意义 */
export async function listPageViews(prisma: PrismaClient, query: PaginationQuery) {
  const [items, total] = await Promise.all([
    prisma.pageView.findMany({ orderBy: { createdAt: 'desc' }, ...toSkipTake(query) }),
    prisma.pageView.count(),
  ]);
  return { items, total };
}
