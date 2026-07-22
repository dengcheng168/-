import type { FastifyRequest } from 'fastify';
import { ok } from '../../lib/api-response.js';
import { paginationQuerySchema } from '../../lib/pagination.js';
import { auditLogFromRequest } from '../../lib/audit-log.js';
import { listAdminRedirects, createRedirect, updateRedirect, deleteRedirect } from './redirects.service.js';
import { createRedirectSchema, updateRedirectSchema } from './redirects.schema.js';

export async function adminListHandler(request: FastifyRequest) {
  const query = paginationQuerySchema.parse(request.query);
  const { items, meta } = await listAdminRedirects(request.server.prisma, query);
  return ok(items, meta);
}

export async function adminCreateHandler(request: FastifyRequest) {
  const input = createRedirectSchema.parse(request.body);
  const redirect = await createRedirect(request.server.prisma, input);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'redirect.create',
    resourceType: 'redirect',
    resourceId: redirect.id,
    summary: `创建重定向 ${redirect.fromPath} → ${redirect.toPath}`,
    after: { fromPath: redirect.fromPath, toPath: redirect.toPath, statusCode: redirect.statusCode },
  });
  return ok(redirect);
}

export async function adminUpdateHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  const input = updateRedirectSchema.parse(request.body);
  const redirect = await updateRedirect(request.server.prisma, Number(request.params.id), input);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'redirect.update',
    resourceType: 'redirect',
    resourceId: redirect.id,
    summary: `更新重定向 ${redirect.fromPath} → ${redirect.toPath}`,
    after: { fromPath: redirect.fromPath, toPath: redirect.toPath, statusCode: redirect.statusCode },
  });
  return ok(redirect);
}

export async function adminDeleteHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  const id = Number(request.params.id);
  await deleteRedirect(request.server.prisma, id);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'redirect.delete',
    resourceType: 'redirect',
    resourceId: id,
    summary: `删除重定向 #${id}`,
  });
  return ok({ deleted: true });
}
