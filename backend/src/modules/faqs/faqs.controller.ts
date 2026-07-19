import type { FastifyReply, FastifyRequest } from 'fastify';
import { ok, fail } from '../../lib/api-response.js';
import { paginationQuerySchema } from '../../lib/pagination.js';
import { listPublishedFaqs, listAdminFaqs, getFaqById, createFaq, updateFaq, deleteFaq, reorderFaqs } from './faqs.service.js';
import { createFaqSchema, updateFaqSchema, reorderSchema } from './faqs.schema.js';

export async function publicListHandler(request: FastifyRequest) {
  return ok(await listPublishedFaqs(request.server.prisma));
}

export async function adminListHandler(request: FastifyRequest<{ Querystring: { q?: string } }>) {
  const query = paginationQuerySchema.parse(request.query);
  const { items, meta } = await listAdminFaqs(request.server.prisma, query, request.query.q);
  return ok(items, meta);
}

export async function adminDetailHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const faq = await getFaqById(request.server.prisma, Number(request.params.id));
  if (!faq) return reply.status(404).send(fail('FAQ 不存在', 'NOT_FOUND'));
  return ok(faq);
}

export async function adminCreateHandler(request: FastifyRequest) {
  return ok(await createFaq(request.server.prisma, createFaqSchema.parse(request.body)));
}

export async function adminUpdateHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  const input = updateFaqSchema.parse(request.body);
  return ok(await updateFaq(request.server.prisma, Number(request.params.id), input));
}

export async function adminDeleteHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  await deleteFaq(request.server.prisma, Number(request.params.id));
  return ok({ deleted: true });
}

export async function adminReorderHandler(request: FastifyRequest) {
  const { items } = reorderSchema.parse(request.body);
  await reorderFaqs(request.server.prisma, items);
  return ok({ reordered: true });
}
