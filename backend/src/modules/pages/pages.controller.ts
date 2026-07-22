import type { FastifyReply, FastifyRequest } from 'fastify';
import { ok, fail } from '../../lib/api-response.js';
import { auditLogFromRequest } from '../../lib/audit-log.js';
import {
  listPages,
  getPageBySlug,
  updatePage,
  getPageTranslationBySlug,
  upsertPageTranslationBySlug,
} from './pages.service.js';
import { updatePageSchema, pageDetailQuerySchema, upsertPageTranslationSchema } from './pages.schema.js';
import { localeParamSchema } from '../translations/translations.schema.js';

export async function publicDetailHandler(
  request: FastifyRequest<{ Params: { slug: string }; Querystring: { locale?: string } }>,
  reply: FastifyReply,
) {
  const { locale } = pageDetailQuerySchema.parse(request.query);
  const page = await getPageBySlug(request.server.prisma, request.params.slug, locale);
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

export async function adminGetTranslationHandler(
  request: FastifyRequest<{ Params: { slug: string; locale: string } }>,
  reply: FastifyReply,
) {
  const { locale } = localeParamSchema.parse({ locale: request.params.locale });
  const translation = await getPageTranslationBySlug(request.server.prisma, request.params.slug, locale);
  if (translation === undefined) return reply.status(404).send(fail('页面不存在', 'NOT_FOUND'));
  return ok(translation);
}

export async function adminUpsertTranslationHandler(
  request: FastifyRequest<{ Params: { slug: string; locale: string } }>,
  reply: FastifyReply,
) {
  const { locale } = localeParamSchema.parse({ locale: request.params.locale });
  const input = upsertPageTranslationSchema.parse(request.body);
  const { slug } = request.params;
  const translation = await upsertPageTranslationBySlug(request.server.prisma, slug, locale, input, request.user.sub);
  if (translation === undefined) return reply.status(404).send(fail('页面不存在', 'NOT_FOUND'));
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'page.translation_update',
    resourceType: 'page',
    resourceId: slug,
    summary: `更新页面 ${slug} 的 ${locale} 翻译（状态：${translation.translationStatus}）`,
    after: { locale, translationStatus: translation.translationStatus },
  });
  return ok(translation);
}
