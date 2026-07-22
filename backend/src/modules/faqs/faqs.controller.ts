import type { FastifyReply, FastifyRequest } from 'fastify';
import { ok, fail } from '../../lib/api-response.js';
import { paginationQuerySchema } from '../../lib/pagination.js';
import { auditLogFromRequest } from '../../lib/audit-log.js';
import {
  listPublishedFaqs,
  listAdminFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
  reorderFaqs,
  getFaqTranslation,
  upsertFaqTranslation,
} from './faqs.service.js';
import {
  createFaqSchema,
  updateFaqSchema,
  reorderSchema,
  faqListQuerySchema,
  upsertFaqTranslationSchema,
} from './faqs.schema.js';
import { localeParamSchema } from '../translations/translations.schema.js';

export async function publicListHandler(request: FastifyRequest<{ Querystring: { locale?: string } }>) {
  const { locale } = faqListQuerySchema.parse(request.query);
  return ok(await listPublishedFaqs(request.server.prisma, locale));
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
  const faq = await createFaq(request.server.prisma, createFaqSchema.parse(request.body));
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'faq.create',
    resourceType: 'faq',
    resourceId: faq.id,
    summary: `创建 FAQ ${faq.question}`,
    after: { question: faq.question, category: faq.category, published: faq.published },
  });
  return ok(faq);
}

export async function adminUpdateHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  const input = updateFaqSchema.parse(request.body);
  const faq = await updateFaq(request.server.prisma, Number(request.params.id), input);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'faq.update',
    resourceType: 'faq',
    resourceId: faq.id,
    summary: `更新 FAQ ${faq.question}`,
    after: { question: faq.question, category: faq.category, published: faq.published },
  });
  return ok(faq);
}

export async function adminDeleteHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  const id = Number(request.params.id);
  await deleteFaq(request.server.prisma, id);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'faq.delete',
    resourceType: 'faq',
    resourceId: id,
    summary: `删除 FAQ #${id}`,
  });
  return ok({ deleted: true });
}

export async function adminReorderHandler(request: FastifyRequest) {
  const { items } = reorderSchema.parse(request.body);
  await reorderFaqs(request.server.prisma, items);
  return ok({ reordered: true });
}

export async function adminGetTranslationHandler(
  request: FastifyRequest<{ Params: { id: string; locale: string } }>,
) {
  const { locale } = localeParamSchema.parse({ locale: request.params.locale });
  const translation = await getFaqTranslation(request.server.prisma, Number(request.params.id), locale);
  return ok(translation);
}

export async function adminUpsertTranslationHandler(
  request: FastifyRequest<{ Params: { id: string; locale: string } }>,
) {
  const { locale } = localeParamSchema.parse({ locale: request.params.locale });
  const input = upsertFaqTranslationSchema.parse(request.body);
  const faqId = Number(request.params.id);
  const translation = await upsertFaqTranslation(request.server.prisma, faqId, locale, input, request.user.sub);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'faq.translation_update',
    resourceType: 'faq',
    resourceId: faqId,
    summary: `更新 FAQ #${faqId} 的 ${locale} 翻译（状态：${translation.translationStatus}）`,
    after: { locale, translationStatus: translation.translationStatus },
  });
  return ok(translation);
}
