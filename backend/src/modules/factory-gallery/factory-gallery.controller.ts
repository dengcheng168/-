import type { FastifyReply, FastifyRequest } from 'fastify';
import { ok, fail } from '../../lib/api-response.js';
import { paginationQuerySchema } from '../../lib/pagination.js';
import { auditLogFromRequest } from '../../lib/audit-log.js';
import {
  listPublishedFactoryGalleryItems,
  listAdminFactoryGalleryItems,
  getFactoryGalleryItemById,
  createFactoryGalleryItem,
  updateFactoryGalleryItem,
  softDeleteFactoryGalleryItem,
  reorderFactoryGalleryItems,
  getFactoryGalleryItemTranslation,
  upsertFactoryGalleryItemTranslation,
} from './factory-gallery.service.js';
import {
  createFactoryGalleryItemSchema,
  updateFactoryGalleryItemSchema,
  reorderSchema,
  factoryGalleryListQuerySchema,
  upsertFactoryGalleryItemTranslationSchema,
} from './factory-gallery.schema.js';
import { localeParamSchema } from '../translations/translations.schema.js';

export async function publicListHandler(request: FastifyRequest<{ Querystring: { locale?: string } }>) {
  const { locale } = factoryGalleryListQuerySchema.parse(request.query);
  return ok(await listPublishedFactoryGalleryItems(request.server.prisma, locale));
}

export async function adminListHandler(request: FastifyRequest<{ Querystring: { q?: string } }>) {
  const query = paginationQuerySchema.parse(request.query);
  const { items, meta } = await listAdminFactoryGalleryItems(request.server.prisma, query, request.query.q);
  return ok(items, meta);
}

export async function adminDetailHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const item = await getFactoryGalleryItemById(request.server.prisma, Number(request.params.id));
  if (!item) return reply.status(404).send(fail('展示图不存在', 'NOT_FOUND'));
  return ok(item);
}

export async function adminCreateHandler(request: FastifyRequest) {
  const input = createFactoryGalleryItemSchema.parse(request.body);
  const item = await createFactoryGalleryItem(request.server.prisma, input);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'factory_gallery_item.create',
    resourceType: 'factory_gallery_item',
    resourceId: item.id,
    summary: `创建工厂展示图 ${item.title}`,
    after: { title: item.title, published: item.published },
  });
  return ok(item);
}

export async function adminUpdateHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const input = updateFactoryGalleryItemSchema.parse(request.body);
  const item = await updateFactoryGalleryItem(request.server.prisma, Number(request.params.id), input);
  if (!item) return reply.status(404).send(fail('展示图不存在或已被删除', 'NOT_FOUND'));
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'factory_gallery_item.update',
    resourceType: 'factory_gallery_item',
    resourceId: item.id,
    summary: `更新工厂展示图 ${item.title}`,
    after: { title: item.title, published: item.published },
  });
  return ok(item);
}

export async function adminDeleteHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  const id = Number(request.params.id);
  await softDeleteFactoryGalleryItem(request.server.prisma, id);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'factory_gallery_item.delete',
    resourceType: 'factory_gallery_item',
    resourceId: id,
    summary: `删除工厂展示图 #${id}`,
  });
  return ok({ deleted: true });
}

export async function adminReorderHandler(request: FastifyRequest) {
  const { items } = reorderSchema.parse(request.body);
  await reorderFactoryGalleryItems(request.server.prisma, items);
  return ok({ reordered: true });
}

export async function adminGetTranslationHandler(request: FastifyRequest<{ Params: { id: string; locale: string } }>) {
  const { locale } = localeParamSchema.parse({ locale: request.params.locale });
  const translation = await getFactoryGalleryItemTranslation(request.server.prisma, Number(request.params.id), locale);
  return ok(translation);
}

export async function adminUpsertTranslationHandler(request: FastifyRequest<{ Params: { id: string; locale: string } }>) {
  const { locale } = localeParamSchema.parse({ locale: request.params.locale });
  const input = upsertFactoryGalleryItemTranslationSchema.parse(request.body);
  const itemId = Number(request.params.id);
  const translation = await upsertFactoryGalleryItemTranslation(request.server.prisma, itemId, locale, input, request.user.sub);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'factory_gallery_item.translation_update',
    resourceType: 'factory_gallery_item',
    resourceId: itemId,
    summary: `更新工厂展示图 #${itemId} 的 ${locale} 翻译（状态：${translation.translationStatus}）`,
    after: { locale, translationStatus: translation.translationStatus },
  });
  return ok(translation);
}
