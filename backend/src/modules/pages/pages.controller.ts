import type { FastifyReply, FastifyRequest } from 'fastify';
import { ok, fail } from '../../lib/api-response.js';
import { listPages, getPageBySlug, updatePage } from './pages.service.js';
import { updatePageSchema } from './pages.schema.js';

export async function publicDetailHandler(request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) {
  const page = await getPageBySlug(request.server.prisma, request.params.slug);
  if (!page) return reply.status(404).send(fail('页面不存在', 'NOT_FOUND'));
  return ok(page);
}

export async function adminListHandler(request: FastifyRequest) {
  return ok(await listPages(request.server.prisma));
}

export async function adminDetailHandler(request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) {
  const page = await getPageBySlug(request.server.prisma, request.params.slug);
  if (!page) return reply.status(404).send(fail('页面不存在', 'NOT_FOUND'));
  return ok(page);
}

export async function adminUpdateHandler(request: FastifyRequest<{ Params: { slug: string } }>) {
  const input = updatePageSchema.parse(request.body);
  return ok(await updatePage(request.server.prisma, request.params.slug, input));
}
