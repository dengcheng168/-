import type { FastifyReply, FastifyRequest } from 'fastify';
import { ok, fail } from '../../lib/api-response.js';
import { paginationQuerySchema } from '../../lib/pagination.js';
import {
  listPublicPosts,
  getPublicPostBySlug,
  listAdminPosts,
  getAdminPostById,
  createPost,
  updatePost,
  softDeletePost,
  updatePostStatus,
} from './blog.service.js';
import { createBlogPostSchema, updateBlogPostSchema, blogListQuerySchema } from './blog.schema.js';

export async function publicListHandler(request: FastifyRequest) {
  const query = paginationQuerySchema.parse(request.query);
  const filters = blogListQuerySchema.parse(request.query);
  const { items, meta } = await listPublicPosts(request.server.prisma, query, {
    categorySlug: filters.category,
    tagSlug: filters.tag,
    q: filters.q,
  });
  return ok(items, meta);
}

export async function publicDetailHandler(request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) {
  const result = await getPublicPostBySlug(request.server.prisma, request.params.slug);
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
  return ok(await createPost(request.server.prisma, input));
}

export async function adminUpdateHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  const input = updateBlogPostSchema.parse(request.body);
  return ok(await updatePost(request.server.prisma, Number(request.params.id), input));
}

export async function adminDeleteHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  await softDeletePost(request.server.prisma, Number(request.params.id));
  return ok({ deleted: true });
}

export async function adminUpdateStatusHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  const { status } = updateBlogPostSchema.pick({ status: true }).parse(request.body);
  return ok(await updatePostStatus(request.server.prisma, Number(request.params.id), status!));
}
