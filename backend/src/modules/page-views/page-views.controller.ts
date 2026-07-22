import type { FastifyRequest } from 'fastify';
import { ok } from '../../lib/api-response.js';
import { paginationQuerySchema, buildPaginationMeta } from '../../lib/pagination.js';
import { recordPageView, listPageViews } from './page-views.service.js';
import { recordPageViewSchema } from './page-views.schema.js';

/** 尽力而为：前台埋点调用失败不应该让访客看到任何错误，出错也返回 ok（不抛异常），
 * 这跟审计日志"写入失败只打日志不影响业务"是同一个哲学，只是这里连日志都不用打——
 * 少几条访问记录不是需要运维关注的事件。 */
export async function publicRecordHandler(request: FastifyRequest) {
  try {
    const input = recordPageViewSchema.parse(request.body);
    await recordPageView(request.server.prisma, input);
  } catch {
    // 忽略格式错误/写入失败，见上方注释
  }
  return ok({ recorded: true });
}

export async function adminListHandler(request: FastifyRequest) {
  const query = paginationQuerySchema.parse(request.query);
  const { items, total } = await listPageViews(request.server.prisma, query);
  return ok(items, buildPaginationMeta(query, total));
}
