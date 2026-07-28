import type { PrismaClient, Prisma } from '@prisma/client';
import { generateUniqueSlug } from '../../lib/slugify.js';
import { toSkipTake, buildPaginationMeta, type PaginationQuery } from '../../lib/pagination.js';
import { sanitizeRichText } from '../../lib/sanitize.js';
import { attachNestedBlogCategoryTranslations } from '../../lib/nested-category.js';
import type { CreateBlogPostInput, UpdateBlogPostInput, UpsertBlogPostTranslationInput } from './blog.schema.js';

const includeRelations = {
  category: true,
  tags: { include: { tag: true } },
};

function serializePost<T extends { tags: { tag: unknown }[] }>(post: T) {
  const { tags, ...rest } = post;
  return { ...rest, tags: tags.map((t) => t.tag) };
}

/** 同 products 模块的 attachTranslations——只在传了 locale 才查一次批量翻译 */
async function attachPostTranslations<T extends { id: number }>(
  prisma: PrismaClient,
  items: T[],
  locale: string | undefined,
) {
  if (!locale || items.length === 0) return items;
  const rows = await prisma.blogPostTranslation.findMany({
    where: { postId: { in: items.map((i) => i.id) }, locale, translationStatus: 'PUBLISHED' },
  });
  const byId = new Map(rows.map((r) => [r.postId, r]));
  return items.map((item) => ({ ...item, translation: byId.get(item.id) ?? null }));
}

export async function listPublicPosts(
  prisma: PrismaClient,
  query: PaginationQuery,
  filters: { categorySlug?: string; tagSlug?: string; q?: string; locale?: string },
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

  const withOwnTranslation = await attachPostTranslations(prisma, items.map(serializePost), filters.locale);
  return {
    items: await attachNestedBlogCategoryTranslations(prisma, withOwnTranslation, filters.locale),
    meta: buildPaginationMeta(query, total),
  };
}

export async function getPublicPostBySlug(prisma: PrismaClient, slug: string, locale?: string) {
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

  const localizedPosts = await attachPostTranslations(prisma, [serializePost(post)], locale);
  const localizedRelated = await attachPostTranslations(prisma, related.map(serializePost), locale);

  const [postsWithCategory, relatedWithCategory] = await Promise.all([
    attachNestedBlogCategoryTranslations(prisma, localizedPosts, locale),
    attachNestedBlogCategoryTranslations(prisma, localizedRelated, locale),
  ]);

  return {
    // localizedPosts 由 [serializePost(post)] 生成，长度恒为 1，这里安全非空断言
    post: postsWithCategory[0]!,
    related: relatedWithCategory,
  };
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
    // 优先按发布时间新到旧排（草稿没有发布时间，SQLite 里 NULL 在 DESC 排序下自然排到最后，
    // 同为 NULL 或发布时间相同时再按创建时间新到旧兜底排序，保持顺序稳定）
    prisma.blogPost.findMany({
      where,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      include: includeRelations,
      ...toSkipTake(query),
    }),
    prisma.blogPost.count({ where }),
  ]);

  return { items: items.map(serializePost), meta: buildPaginationMeta(query, total) };
}

export async function getAdminPostById(prisma: PrismaClient, id: number) {
  const post = await prisma.blogPost.findFirst({ where: { id, deletedAt: null }, include: includeRelations });
  return post ? serializePost(post) : null;
}

export async function createPost(prisma: PrismaClient, input: CreateBlogPostInput) {
  const { tagIds, body, publishedAt: publishedAtInput, ...rest } = input;
  const slug = await generateUniqueSlug(input.slug ?? input.title, async (candidate) => {
    const found = await prisma.blogPost.findUnique({ where: { slug: candidate } });
    return !!found;
  });

  // 手动指定了发布时间就用手动值（哪怕是草稿也允许提前填好，方便按计划时间排序）；
  // 没手动指定时保留原逻辑：首次直接创建为已发布状态才自动盖当前时间戳。
  const publishedAt = publishedAtInput
    ? new Date(publishedAtInput)
    : rest.status === 'PUBLISHED'
      ? new Date()
      : undefined;

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

/**
 * 更新前先确认文章仍然存在且未被软删除，避免并发场景下"复活"一个已经被删除的文章
 * （做法同 products.service.ts 的 updateProduct，见那里的注释）。返回 null 交给 controller 转成 404。
 */
export async function updatePost(prisma: PrismaClient, id: number, input: UpdateBlogPostInput) {
  const { tagIds, body, publishedAt: publishedAtInput, ...rest } = input;

  const existing = await prisma.blogPost.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return null;
  // 手动指定了发布时间就用手动值（可以用来给文章改到任意时间点，从而调整"最新到最旧"的排序位置）；
  // 没手动指定时保留原逻辑：只有从没发布过的文章第一次转为已发布，才自动盖当前时间戳，
  // 已经发布过的文章后续再保存不会被自动改动发布时间。
  const publishedAt = publishedAtInput
    ? new Date(publishedAtInput)
    : rest.status === 'PUBLISHED' && existing?.publishedAt == null
      ? new Date()
      : undefined;

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

export function getPostTranslation(prisma: PrismaClient, postId: number, locale: string) {
  return prisma.blogPostTranslation.findUnique({ where: { postId_locale: { postId, locale } } });
}

export function upsertPostTranslation(
  prisma: PrismaClient,
  postId: number,
  locale: string,
  input: UpsertBlogPostTranslationInput,
  updatedBy?: number,
) {
  const { body, ...rest } = input;
  const data = {
    ...rest,
    ...(body !== undefined ? { body: sanitizeRichText(body) } : {}),
    updatedBy,
  };
  return prisma.blogPostTranslation.upsert({
    where: { postId_locale: { postId, locale } },
    create: { postId, locale, ...data },
    update: data,
  });
}
