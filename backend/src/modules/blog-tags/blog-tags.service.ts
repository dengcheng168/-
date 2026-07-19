import type { PrismaClient } from '@prisma/client';
import { generateUniqueSlug } from '../../lib/slugify.js';
import type { CreateBlogTagInput } from './blog-tags.schema.js';

export async function listBlogTags(prisma: PrismaClient) {
  const tags = await prisma.blogTag.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { posts: true } } },
  });
  return tags.map(({ _count, ...tag }) => ({ ...tag, postCount: _count.posts }));
}

export async function createBlogTag(prisma: PrismaClient, input: CreateBlogTagInput) {
  const slug = await generateUniqueSlug(input.slug ?? input.name, async (candidate) => {
    const found = await prisma.blogTag.findUnique({ where: { slug: candidate } });
    return !!found;
  });
  return prisma.blogTag.create({ data: { name: input.name, slug } });
}

export function deleteBlogTag(prisma: PrismaClient, id: number) {
  return prisma.blogTag.delete({ where: { id } });
}
