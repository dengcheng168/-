import type { FastifyReply, FastifyRequest } from 'fastify';
import { ok, fail } from '../../lib/api-response.js';
import { paginationQuerySchema } from '../../lib/pagination.js';
import {
  listPublishedTestimonials,
  listAdminTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  reorderTestimonials,
} from './testimonials.service.js';
import { createTestimonialSchema, updateTestimonialSchema, reorderSchema } from './testimonials.schema.js';

export async function publicListHandler(request: FastifyRequest) {
  return ok(await listPublishedTestimonials(request.server.prisma));
}

export async function adminListHandler(request: FastifyRequest<{ Querystring: { q?: string } }>) {
  const query = paginationQuerySchema.parse(request.query);
  const { items, meta } = await listAdminTestimonials(request.server.prisma, query, request.query.q);
  return ok(items, meta);
}

export async function adminDetailHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const t = await getTestimonialById(request.server.prisma, Number(request.params.id));
  if (!t) return reply.status(404).send(fail('客户评价不存在', 'NOT_FOUND'));
  return ok(t);
}

export async function adminCreateHandler(request: FastifyRequest) {
  return ok(await createTestimonial(request.server.prisma, createTestimonialSchema.parse(request.body)));
}

export async function adminUpdateHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  const input = updateTestimonialSchema.parse(request.body);
  return ok(await updateTestimonial(request.server.prisma, Number(request.params.id), input));
}

export async function adminDeleteHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  await deleteTestimonial(request.server.prisma, Number(request.params.id));
  return ok({ deleted: true });
}

export async function adminReorderHandler(request: FastifyRequest) {
  const { items } = reorderSchema.parse(request.body);
  await reorderTestimonials(request.server.prisma, items);
  return ok({ reordered: true });
}
