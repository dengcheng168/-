import type { PrismaClient, Prisma } from '@prisma/client';
import { generateUniqueSlug } from '../../lib/slugify.js';
import { toSkipTake, buildPaginationMeta, type PaginationQuery } from '../../lib/pagination.js';
import { sanitizeRichText } from '../../lib/sanitize.js';
import type { CreateBlogPostInput, UpdateBlogPostInput } from './blog.schema.js';

const includeRelations = {
  category: true,
  tags: { include: { tag: true } },
};

function serializePost<T extends { tags: { tag: unknown }[] }>(post: T) {
  const { tags, ...rest } = post;
  return { ...rest, tags: tags.map((t) => t.tag) };
}

export async function listPublicPosts(
  prisma: PrismaClient,
  query: PaginationQuery,
  filters: { categorySlug?: string; tagSlug?: string; q?: string },
) {
  const where: Prisma.BlogPostWhereInput = {
    status: 'PUBLISHED',
    deletedAt: null,
    ...(filters.categorySlug ? { category: { slug: filters.categorySlug } } : {}),
    ...(filters.tagSlug ? { tags: { some: { tag: { slug: filters.tagSlug } } } } : {}),
    ...(filters.q ? { title: { contains: filters.q } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      include: includeRelations,
      ...toSkipTake(query),
    }),
    prisma.blogPost.count({ where }),
  ]);

  return { items: items.map(serializePost), meta: buildPaginationMeta(query, total) };
}

export async function getPublicPostBySlug(prisma: PrismaClient, slug: string) {
  const post = await prisma.blogPost.findFirst({
    where: { slug, status: 'PUBLISHED', deletedAt: null },
    include: includeRelations,
  });
  if (!post) return null;

  const related = await prisma.blogPost.findMany({
    where: { categoryId: post.categoryId, status: 'PUBLISHED', deletedAt: null, id: { not: post.id } },
    orderBy: { publishedAt: 'desc' },
    include: includeRelations,
    take: 3,
  });

  return { post: serializePost(post), related: related.map(serializePost) };
}

export async function listAdminPosts(
  prisma: PrismaClient,
  query: PaginationQuery,
  filters: { q?: string; status?: string },
) {
  const where: Prisma.BlogPostWhereInput = {
    deletedAt: null,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.q ? { title: { contains: filters.q } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.blogPost.findMany({ where, orderBy: { createdAt: 'desc' }, include: includeRelations, ...toSkipTake(query) }),
    prisma.blogPost.count({ where }),
  ]);

  return { items: items.map(serializePost), meta: buildPaginationMeta(query, total) };
}

export async function getAdminPostById(prisma: PrismaClient, id: number) {
  const post = await prisma.blogPost.findFirst({ where: { id, deletedAt: null }, include: includeRelations });
  return post ? serializePost(post) : null;
}

export async function createPost(prisma: PrismaClient, input: CreateBlogPostInput) {
  const { tagIds, body, ...rest } = input;
  const slug = await generateUniqueSlug(input.slug ?? input.title, async (candidate) => {
    const found = await prisma.blogPost.findUnique({ where: { slug: candidate } });
    return !!found;
  });

  const publishedAt = rest.status === 'PUBLISHED' ? new Date() : undefined;

  const post = await prisma.blogPost.create({
    data: {
      ...(rest as Prisma.BlogPostUncheckedCreateInput),
      body: sanitizeRichText(body),
      slug,
      ...(publishedAt ? { publishedAt } : {}),
      tags: { create: (tagIds ?? []).map((tagId) => ({ tagId })) },
    },
    include: includeRelations,
  });

  return serializePost(post);
}

export async function updatePost(prisma: PrismaClient, id: number, input: UpdateBlogPostInput) {
  const { tagIds, body, ...rest } = input;

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  const publishedAt =
    rest.status === 'PUBLISHED' && existing?.publishedAt == null ? new Date() : undefined;

  const post = await prisma.$transaction(async (tx) => {
    if (tagIds !== undefined) {
      await tx.blogPostTag.deleteMany({ where: { postId: id } });
    }

    return tx.blogPost.update({
      where: { id },
      data: {
        ...(rest as Prisma.BlogPostUncheckedUpdateInput),
        ...(body !== undefined ? { body: sanitizeRichText(body) } : {}),
        ...(publishedAt ? { publishedAt } : {}),
        ...(tagIds !== undefined ? { tags: { create: tagIds.map((tagId) => ({ tagId })) } } : {}),
      },
      include: includeRelations,
    });
  });

  return serializePost(post);
}

export function softDeletePost(prisma: PrismaClient, id: number) {
  return prisma.blogPost.update({ where: { id }, data: { deletedAt: new Date() } });
}

export function updatePostStatus(prisma: PrismaClient, id: number, status: string) {
  return prisma.blogPost.update({
    where: { id },
    data: { status, ...(status === 'PUBLISHED' ? { publishedAt: new Date() } : {}) },
  });
}
