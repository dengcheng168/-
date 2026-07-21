import type { FastifyReply, FastifyRequest } from 'fastify';
import { ok, fail } from '../../lib/api-response.js';
import { paginationQuerySchema } from '../../lib/pagination.js';
import { auditLogFromRequest } from '../../lib/audit-log.js';
import {
  listPublishedCategories,
  getPublishedCategoryBySlug,
  listAdminCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  softDeleteCategory,
  reorderCategories,
  getCategoryTranslation,
  upsertCategoryTranslation,
} from './categories.service.js';
import {
  createCategorySchema,
  updateCategorySchema,
  reorderSchema,
  categoryDetailQuerySchema,
  upsertCategoryTranslationSchema,
} from './categories.schema.js';
import { localeParamSchema } from '../translations/translations.schema.js';
import { DEFAULT_PAGE_SIZE } from '../../config/constants.js';

export async function publicListHandler(request: FastifyRequest<{ Querystring: { locale?: string } }>) {
  const { locale } = categoryDetailQuerySchema.parse(request.query);
  const items = await listPublishedCategories(request.server.prisma, locale);
  return ok(items);
}

export async function publicDetailHandler(
  request: FastifyRequest<{ Params: { slug: string }; Querystring: Record<string, string> }>,
  reply: FastifyReply,
) {
  const { locale } = categoryDetailQuerySchema.parse(request.query);
  const category = await getPublishedCategoryBySlug(request.server.prisma, request.params.slug, locale);
  if (!category) return reply.status(404).send(fail('分类不存在', 'NOT_FOUND'));

  const query = paginationQuerySchema.parse(request.query);
  const { skip, take } = { skip: (query.page - 1) * query.pageSize, take: query.pageSize };
  const where = { categoryId: category.id, status: 'PUBLISHED', deletedAt: null };

  const [products, total] = await Promise.all([
    request.server.prisma.product.findMany({ where, orderBy: { sortOrder: 'asc' }, skip, take }),
    request.server.prisma.product.count({ where }),
  ]);

  return ok(
    { category, products },
    { page: query.page, pageSize: query.pageSize, total, totalPages: Math.max(1, Math.ceil(total / (query.pageSize || DEFAULT_PAGE_SIZE))) },
  );
}

export async function adminListHandler(request: FastifyRequest<{ Querystring: { q?: string } }>) {
  const query = paginationQuerySchema.parse(request.query);
  const { items, meta } = await listAdminCategories(request.server.prisma, query, request.query.q);
  return ok(items, meta);
}

export async function adminDetailHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const category = await getCategoryById(request.server.prisma, Number(request.params.id));
  if (!category) return reply.status(404).send(fail('分类不存在', 'NOT_FOUND'));
  return ok(category);
}

export async function adminCreateHandler(request: FastifyRequest) {
  const input = createCategorySchema.parse(request.body);
  const category = await createCategory(request.server.prisma, input);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'product_category.create',
    resourceType: 'product_category',
    resourceId: category.id,
    summary: `创建产品分类 ${category.name}`,
    after: { name: category.name, slug: category.slug, published: category.published },
  });
  return ok(category);
}

export async function adminUpdateHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
) {
  const input = updateCategorySchema.parse(request.body);
  const category = await updateCategory(request.server.prisma, Number(request.params.id), input);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'product_category.update',
    resourceType: 'product_category',
    resourceId: category.id,
    summary: `更新产品分类 ${category.name}`,
    after: { name: category.name, slug: category.slug, published: category.published },
  });
  return ok(category);
}

export async function adminDeleteHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  const id = Number(request.params.id);
  await softDeleteCategory(request.server.prisma, id);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'product_category.delete',
    resourceType: 'product_category',
    resourceId: id,
    summary: `删除产品分类 #${id}`,
  });
  return ok({ deleted: true });
}

export async function adminReorderHandler(request: FastifyRequest) {
  const { items } = reorderSchema.parse(request.body);
  await reorderCategories(request.server.prisma, items);
  return ok({ reordered: true });
}

export async function adminGetTranslationHandler(
  request: FastifyRequest<{ Params: { id: string; locale: string } }>,
) {
  const { locale } = localeParamSchema.parse({ locale: request.params.locale });
  const translation = await getCategoryTranslation(request.server.prisma, Number(request.params.id), locale);
  return ok(translation);
}

export async function adminUpsertTranslationHandler(
  request: FastifyRequest<{ Params: { id: string; locale: string } }>,
) {
  const { locale } = localeParamSchema.parse({ locale: request.params.locale });
  const input = upsertCategoryTranslationSchema.parse(request.body);
  const categoryId = Number(request.params.id);
  const translation = await upsertCategoryTranslation(request.server.prisma, categoryId, locale, input, request.user.sub);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'product_category.translation_update',
    resourceType: 'product_category',
    resourceId: categoryId,
    summary: `更新产品分类 #${categoryId} 的 ${locale} 翻译（状态：${translation.translationStatus}）`,
    after: { locale, translationStatus: translation.translationStatus },
  });
  return ok(translation);
}
