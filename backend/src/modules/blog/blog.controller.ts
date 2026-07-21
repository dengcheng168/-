import type { FastifyReply, FastifyRequest } from 'fastify';
import { ok, fail } from '../../lib/api-response.js';
import { paginationQuerySchema } from '../../lib/pagination.js';
import { auditLogFromRequest } from '../../lib/audit-log.js';
import {
  listPublicPosts,
  getPublicPostBySlug,
  listAdminPosts,
  getAdminPostById,
  createPost,
  updatePost,
  softDeletePost,
  updatePostStatus,
  getPostTranslation,
  upsertPostTranslation,
} from './blog.service.js';
import {
  createBlogPostSchema,
  updateBlogPostSchema,
  blogListQuerySchema,
  blogDetailQuerySchema,
  upsertBlogPostTranslationSchema,
} from './blog.schema.js';
import { localeParamSchema } from '../translations/translations.schema.js';

export async function publicListHandler(request: FastifyRequest) {
  const query = paginationQuerySchema.parse(request.query);
  const filters = blogListQuerySchema.parse(request.query);
  const { items, meta } = await listPublicPosts(request.server.prisma, query, {
    categorySlug: filters.category,
    tagSlug: filters.tag,
    q: filters.q,
    locale: filters.locale,
  });
  return ok(items, meta);
}

export async function publicDetailHandler(
  request: FastifyRequest<{ Params: { slug: string }; Querystring: { locale?: string } }>,
  reply: FastifyReply,
) {
  const { locale } = blogDetailQuerySchema.parse(request.query);
  const result = await getPublicPostBySlug(request.server.prisma, request.params.slug, locale);
  if (!result) return reply.status(404).send(fail('文章不存在', 'NOT_FOUND'));
  return ok(result);
}

export async function adminListHandler(request: FastifyRequest<{ Querystring: { q?: string; status?: string } }>) {
  const query = paginationQuerySchema.parse(request.query);
  const { items, meta } = await listAdminPosts(request.server.prisma, query, {
    q: request.query.q,
    status: request.query.status,
  });
  return ok(items, meta);
}

export async function adminDetailHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const post = await getAdminPostById(request.server.prisma, Number(request.params.id));
  if (!post) return reply.status(404).send(fail('文章不存在', 'NOT_FOUND'));
  return ok(post);
}

export async function adminCreateHandler(request: FastifyRequest) {
  const input = createBlogPostSchema.parse(request.body);
  const post = await createPost(request.server.prisma, input);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'blog_post.create',
    resourceType: 'blog_post',
    resourceId: post.id,
    summary: `创建文章 ${post.title}`,
    after: { title: post.title, slug: post.slug, status: post.status },
  });
  return ok(post);
}

export async function adminUpdateHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  const input = updateBlogPostSchema.parse(request.body);
  const post = await updatePost(request.server.prisma, Number(request.params.id), input);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'blog_post.update',
    resourceType: 'blog_post',
    resourceId: post.id,
    summary: `更新文章 ${post.title}`,
    after: { title: post.title, slug: post.slug, status: post.status },
  });
  return ok(post);
}

export async function adminDeleteHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  const id = Number(request.params.id);
  await softDeletePost(request.server.prisma, id);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'blog_post.delete',
    resourceType: 'blog_post',
    resourceId: id,
    summary: `删除文章 #${id}`,
  });
  return ok({ deleted: true });
}

export async function adminUpdateStatusHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  const { status } = updateBlogPostSchema.pick({ status: true }).parse(request.body);
  const post = await updatePostStatus(request.server.prisma, Number(request.params.id), status!);
  await auditLogFromRequest(request.server.prisma, request, {
    action: status === 'PUBLISHED' ? 'blog_post.publish' : 'blog_post.unpublish',
    resourceType: 'blog_post',
    resourceId: post.id,
    summary: `${status === 'PUBLISHED' ? '发布' : '下架'}文章 ${post.title}`,
    after: { status: post.status },
  });
  return ok(post);
}

export async function adminGetTranslationHandler(
  request: FastifyRequest<{ Params: { id: string; locale: string } }>,
) {
  const { locale } = localeParamSchema.parse({ locale: request.params.locale });
  const translation = await getPostTranslation(request.server.prisma, Number(request.params.id), locale);
  return ok(translation);
}

export async function adminUpsertTranslationHandler(
  request: FastifyRequest<{ Params: { id: string; locale: string } }>,
) {
  const { locale } = localeParamSchema.parse({ locale: request.params.locale });
  const input = upsertBlogPostTranslationSchema.parse(request.body);
  const postId = Number(request.params.id);
  const translation = await upsertPostTranslation(request.server.prisma, postId, locale, input, request.user.sub);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'blog_post.translation_update',
    resourceType: 'blog_post',
    resourceId: postId,
    summary: `更新文章 #${postId} 的 ${locale} 翻译（状态：${translation.translationStatus}）`,
    after: { locale, translationStatus: translation.translationStatus },
  });
  return ok(translation);
}
