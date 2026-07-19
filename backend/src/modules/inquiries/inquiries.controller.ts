import type { FastifyReply, FastifyRequest } from 'fastify';
import { ok, fail } from '../../lib/api-response.js';
import { paginationQuerySchema } from '../../lib/pagination.js';
import {
  createInquiry,
  listAdminInquiries,
  getInquiryById,
  updateInquiry,
  deleteInquiry,
  exportInquiriesCsv,
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
  return ok(await updateInquiry(request.server.prisma, Number(request.params.id), input));
}

export async function adminDeleteHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  await deleteInquiry(request.server.prisma, Number(request.params.id));
  return ok({ deleted: true });
}

export async function adminExportCsvHandler(
  request: FastifyRequest<{ Querystring: { status?: string } }>,
  reply: FastifyReply,
) {
  const csv = await exportInquiriesCsv(request.server.prisma, { status: request.query.status });
  reply.header('Content-Type', 'text/csv; charset=utf-8');
  reply.header('Content-Disposition', 'attachment; filename="inquiries.csv"');
  return reply.send(csv);
}
