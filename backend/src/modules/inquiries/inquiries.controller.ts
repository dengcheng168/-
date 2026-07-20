import type { FastifyReply, FastifyRequest } from 'fastify';
import { ok, fail } from '../../lib/api-response.js';
import { paginationQuerySchema, toSkipTake, buildPaginationMeta } from '../../lib/pagination.js';
import { auditLogFromRequest } from '../../lib/audit-log.js';
import {
  createInquiry,
  listAdminInquiries,
  getInquiryById,
  updateInquiry,
  deleteInquiry,
  exportInquiriesCsv,
  listCustomers,
  getInquirySourceStats,
  TurnstileVerificationError,
} from './inquiries.service.js';
import { createInquirySchema, updateInquirySchema, inquiryListQuerySchema } from './inquiries.schema.js';

export async function publicCreateHandler(request: FastifyRequest, reply: FastifyReply) {
  const input = createInquirySchema.parse(request.body);

  try {
    const inquiry = await createInquiry(request.server.prisma, input, {
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });
    return ok({ id: inquiry.id, submitted: true });
  } catch (err) {
    if (err instanceof TurnstileVerificationError) {
      return reply.status(400).send(fail(err.message, 'TURNSTILE_FAILED'));
    }
    throw err;
  }
}

export async function adminListHandler(
  request: FastifyRequest<{ Querystring: { status?: string; q?: string } }>,
) {
  const query = paginationQuerySchema.parse(request.query);
  const filters = inquiryListQuerySchema.parse(request.query);
  const { items, meta } = await listAdminInquiries(request.server.prisma, query, filters);
  return ok(items, meta);
}

export async function adminDetailHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const inquiry = await getInquiryById(request.server.prisma, Number(request.params.id));
  if (!inquiry) return reply.status(404).send(fail('询盘不存在', 'NOT_FOUND'));
  return ok(inquiry);
}

export async function adminUpdateHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  const input = updateInquirySchema.parse(request.body);
  const inquiry = await updateInquiry(request.server.prisma, Number(request.params.id), input);
  // 该模型没有负责人/指派字段，只在状态确实发生变更时记录审计日志（备注更新不属于本次要求的必审范围）
  if (input.status !== undefined) {
    await auditLogFromRequest(request.server.prisma, request, {
      action: 'inquiry.status_change',
      resourceType: 'inquiry',
      resourceId: inquiry.id,
      summary: `更新询盘 #${inquiry.id} 状态为 ${inquiry.status}`,
      after: { status: inquiry.status },
    });
  }
  return ok(inquiry);
}

export async function adminDeleteHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  await deleteInquiry(request.server.prisma, Number(request.params.id));
  return ok({ deleted: true });
}

export async function adminExportCsvHandler(
  request: FastifyRequest<{ Querystring: { status?: string } }>,
  reply: FastifyReply,
) {
  const { csv, count } = await exportInquiriesCsv(request.server.prisma, { status: request.query.status });
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'inquiry.export',
    resourceType: 'inquiry',
    summary: `导出询盘 CSV（状态：${request.query.status ?? '全部'}，共 ${count} 条）`,
    metadata: { status: request.query.status ?? null, count },
  });
  reply.header('Content-Type', 'text/csv; charset=utf-8');
  reply.header('Content-Disposition', 'attachment; filename="inquiries.csv"');
  return reply.send(csv);
}

export async function adminCustomersHandler(request: FastifyRequest<{ Querystring: { q?: string } }>) {
  const customers = await listCustomers(request.server.prisma, { q: request.query.q });
  return ok(customers);
}

export async function adminSourceStatsHandler(request: FastifyRequest) {
  const stats = await getInquirySourceStats(request.server.prisma);
  return ok(stats);
}

export async function adminExportLogsHandler(request: FastifyRequest) {
  const query = paginationQuerySchema.parse(request.query);
  const where = { entityType: 'inquiry', action: 'inquiry.export' };
  const [items, total] = await Promise.all([
    request.server.prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, ...toSkipTake(query) }),
    request.server.prisma.auditLog.count({ where }),
  ]);
  return ok(items, buildPaginationMeta(query, total));
}
