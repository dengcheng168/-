import type { FastifyReply, FastifyRequest } from 'fastify';
import { ok, fail } from '../../lib/api-response.js';
import { paginationQuerySchema } from '../../lib/pagination.js';
import {
  listPublishedCertificates,
  listAdminCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  softDeleteCertificate,
  reorderCertificates,
} from './certificates.service.js';
import { createCertificateSchema, updateCertificateSchema, reorderSchema } from './certificates.schema.js';

export async function publicListHandler(request: FastifyRequest) {
  return ok(await listPublishedCertificates(request.server.prisma));
}

export async function adminListHandler(request: FastifyRequest<{ Querystring: { q?: string } }>) {
  const query = paginationQuerySchema.parse(request.query);
  const { items, meta } = await listAdminCertificates(request.server.prisma, query, request.query.q);
  return ok(items, meta);
}

export async function adminDetailHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const cert = await getCertificateById(request.server.prisma, Number(request.params.id));
  if (!cert) return reply.status(404).send(fail('证书不存在', 'NOT_FOUND'));
  return ok(cert);
}

export async function adminCreateHandler(request: FastifyRequest) {
  const input = createCertificateSchema.parse(request.body);
  return ok(await createCertificate(request.server.prisma, input));
}

export async function adminUpdateHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  const input = updateCertificateSchema.parse(request.body);
  return ok(await updateCertificate(request.server.prisma, Number(request.params.id), input));
}

export async function adminDeleteHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  await softDeleteCertificate(request.server.prisma, Number(request.params.id));
  return ok({ deleted: true });
}

export async function adminReorderHandler(request: FastifyRequest) {
  const { items } = reorderSchema.parse(request.body);
  await reorderCertificates(request.server.prisma, items);
  return ok({ reordered: true });
}
