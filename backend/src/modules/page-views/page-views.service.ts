import type { PrismaClient } from '@prisma/client';
import { toSkipTake } from '../../lib/pagination.js';
import type { PageViewListQuery, RecordPageViewInput } from './page-views.schema.js';

export function recordPageView(prisma: PrismaClient, input: RecordPageViewInput) {
  return prisma.pageView.create({ data: { path: input.path } });
}

/** 只给后台"数据概览"用来复用现有 countOf(path) 走 meta.total 的模式，不需要展示每一行的意义 */
export async function listPageViews(prisma: PrismaClient, query: PageViewListQuery) {
  const where = query.from || query.to
    ? { createdAt: { ...(query.from ? { gte: query.from } : {}), ...(query.to ? { lt: query.to } : {}) } }
    : undefined;
  const [items, total] = await Promise.all([
    prisma.pageView.findMany({ where, orderBy: { createdAt: 'desc' }, ...toSkipTake(query) }),
    prisma.pageView.count({ where }),
  ]);
  return { items, total };
}
