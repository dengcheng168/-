import type { FastifyReply, FastifyRequest } from 'fastify';
import { ok, fail } from '../../lib/api-response.js';
import { paginationQuerySchema } from '../../lib/pagination.js';
import { auditLogFromRequest } from '../../lib/audit-log.js';
import {
  listPublishedCertificates,
  listAdminCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  softDeleteCertificate,
  reorderCertificates,
  getCertificateTranslation,
  upsertCertificateTranslation,
} from './certificates.service.js';
import {
  createCertificateSchema,
  updateCertificateSchema,
  reorderSchema,
  certificateListQuerySchema,
  upsertCertificateTranslationSchema,
} from './certificates.schema.js';
import { localeParamSchema } from '../translations/translations.schema.js';

export async function publicListHandler(request: FastifyRequest<{ Querystring: { locale?: string } }>) {
  const { locale } = certificateListQuerySchema.parse(request.query);
  return ok(await listPublishedCertificates(request.server.prisma, locale));
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
  const cert = await createCertificate(request.server.prisma, input);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'certificate.create',
    resourceType: 'certificate',
    resourceId: cert.id,
    summary: `创建证书 ${cert.name}`,
    after: { name: cert.name, certType: cert.certType, published: cert.published },
  });
  return ok(cert);
}

export async function adminUpdateHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  const input = updateCertificateSchema.parse(request.body);
  const cert = await updateCertificate(request.server.prisma, Number(request.params.id), input);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'certificate.update',
    resourceType: 'certificate',
    resourceId: cert.id,
    summary: `更新证书 ${cert.name}`,
    after: { name: cert.name, certType: cert.certType, published: cert.published },
  });
  return ok(cert);
}

export async function adminDeleteHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  const id = Number(request.params.id);
  await softDeleteCertificate(request.server.prisma, id);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'certificate.delete',
    resourceType: 'certificate',
    resourceId: id,
    summary: `删除证书 #${id}`,
  });
  return ok({ deleted: true });
}

export async function adminReorderHandler(request: FastifyRequest) {
  const { items } = reorderSchema.parse(request.body);
  await reorderCertificates(request.server.prisma, items);
  return ok({ reordered: true });
}

export async function adminGetTranslationHandler(
  request: FastifyRequest<{ Params: { id: string; locale: string } }>,
) {
  const { locale } = localeParamSchema.parse({ locale: request.params.locale });
  const translation = await getCertificateTranslation(request.server.prisma, Number(request.params.id), locale);
  return ok(translation);
}

export async function adminUpsertTranslationHandler(
  request: FastifyRequest<{ Params: { id: string; locale: string } }>,
) {
  const { locale } = localeParamSchema.parse({ locale: request.params.locale });
  const input = upsertCertificateTranslationSchema.parse(request.body);
  const certificateId = Number(request.params.id);
  const translation = await upsertCertificateTranslation(request.server.prisma, certificateId, locale, input, request.user.sub);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'certificate.translation_update',
    resourceType: 'certificate',
    resourceId: certificateId,
    summary: `更新证书 #${certificateId} 的 ${locale} 翻译（状态：${translation.translationStatus}）`,
    after: { locale, translationStatus: translation.translationStatus },
  });
  return ok(translation);
}
