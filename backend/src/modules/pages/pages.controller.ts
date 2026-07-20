import type { FastifyReply, FastifyRequest } from 'fastify';
import { ok, fail } from '../../lib/api-response.js';
import { auditLogFromRequest } from '../../lib/audit-log.js';
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
  const page = await updatePage(request.server.prisma, request.params.slug, input);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'page.update',
    resourceType: 'page',
    resourceId: page.slug,
    summary: `更新页面 ${page.title}`,
    after: { title: page.title, seoTitle: page.seoTitle },
  });
  return ok(page);
}
