import type { FastifyRequest } from 'fastify';
import { ok } from '../../lib/api-response.js';
import { auditLogFromRequest } from '../../lib/audit-log.js';
import { listBlogTags, createBlogTag, deleteBlogTag } from './blog-tags.service.js';
import { createBlogTagSchema } from './blog-tags.schema.js';

export async function publicListHandler(request: FastifyRequest) {
  return ok(await listBlogTags(request.server.prisma));
}

export async function adminListHandler(request: FastifyRequest) {
  return ok(await listBlogTags(request.server.prisma));
}

export async function adminCreateHandler(request: FastifyRequest) {
  const input = createBlogTagSchema.parse(request.body);
  const tag = await createBlogTag(request.server.prisma, input);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'blog_tag.create',
    resourceType: 'blog_tag',
    resourceId: tag.id,
    summary: `创建博客标签 ${tag.name}`,
    after: { name: tag.name, slug: tag.slug },
  });
  return ok(tag);
}

export async function adminDeleteHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  const id = Number(request.params.id);
  await deleteBlogTag(request.server.prisma, id);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'blog_tag.delete',
    resourceType: 'blog_tag',
    resourceId: id,
    summary: `删除博客标签 #${id}`,
  });
  return ok({ deleted: true });
}
