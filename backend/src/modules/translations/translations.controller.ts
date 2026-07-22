import type { FastifyRequest } from 'fastify';
import { ok } from '../../lib/api-response.js';
import { auditLogFromRequest } from '../../lib/audit-log.js';
import { getTranslationMap, upsertTranslations } from './translations.service.js';
import { localeParamSchema, upsertTranslationsSchema } from './translations.schema.js';

export async function publicTranslationsHandler(request: FastifyRequest<{ Params: { locale: string } }>) {
  const { locale } = localeParamSchema.parse(request.params);
  return ok(await getTranslationMap(request.server.prisma, locale));
}

export async function adminListTranslationsHandler(request: FastifyRequest<{ Querystring: { locale: string } }>) {
  const { locale } = localeParamSchema.parse({ locale: request.query.locale });
  return ok(await getTranslationMap(request.server.prisma, locale));
}

export async function adminUpsertTranslationsHandler(request: FastifyRequest) {
  const { locale, entries } = upsertTranslationsSchema.parse(request.body);
  const { upserted, cleared } = await upsertTranslations(request.server.prisma, locale, entries);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'translations.update',
    resourceType: 'translation',
    resourceId: locale,
    summary: `更新 ${locale} 译文：${upserted} 条写入，${cleared} 条清除回退英文`,
    metadata: { locale, upserted, cleared, keys: entries.map((e) => e.key) },
  });
  return ok({ upserted, cleared });
}
