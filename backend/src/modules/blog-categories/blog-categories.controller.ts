import type { FastifyReply, FastifyRequest } from 'fastify';
import { ok, fail } from '../../lib/api-response.js';
import { paginationQuerySchema } from '../../lib/pagination.js';
import { auditLogFromRequest } from '../../lib/audit-log.js';
import {
  listPublishedBlogCategories,
  listAdminBlogCategories,
  getBlogCategoryById,
  createBlogCategory,
  updateBlogCategory,
  softDeleteBlogCategory,
} from './blog-categories.service.js';
import { createBlogCategorySchema, updateBlogCategorySchema } from './blog-categories.schema.js';

export async function publicListHandler(request: FastifyRequest) {
  const items = await listPublishedBlogCategories(request.server.prisma);
  return ok(items);
}

export async function adminListHandler(request: FastifyRequest<{ Querystring: { q?: string } }>) {
  const query = paginationQuerySchema.parse(request.query);
  const { items, meta } = await listAdminBlogCategories(request.server.prisma, query, request.query.q);
  return ok(items, meta);
}

export async function adminDetailHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const category = await getBlogCategoryById(request.server.prisma, Number(request.params.id));
  if (!category) return reply.status(404).send(fail('分类不存在', 'NOT_FOUND'));
  return ok(category);
}

export async function adminCreateHandler(request: FastifyRequest) {
  const input = createBlogCategorySchema.parse(request.body);
  const category = await createBlogCategory(request.server.prisma, input);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'blog_category.create',
    resourceType: 'blog_category',
    resourceId: category.id,
    summary: `创建博客分类 ${category.name}`,
    after: { name: category.name, slug: category.slug, published: category.published },
  });
  return ok(category);
}

export async function adminUpdateHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  const input = updateBlogCategorySchema.parse(request.body);
  const category = await updateBlogCategory(request.server.prisma, Number(request.params.id), input);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'blog_category.update',
    resourceType: 'blog_category',
    resourceId: category.id,
    summary: `更新博客分类 ${category.name}`,
    after: { name: category.name, slug: category.slug, published: category.published },
  });
  return ok(category);
}

export async function adminDeleteHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  const id = Number(request.params.id);
  await softDeleteBlogCategory(request.server.prisma, id);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'blog_category.delete',
    resourceType: 'blog_category',
    resourceId: id,
    summary: `删除博客分类 #${id}`,
  });
  return ok({ deleted: true });
}
