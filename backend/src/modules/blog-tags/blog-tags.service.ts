import type { PrismaClient } from '@prisma/client';
import { generateUniqueSlug } from '../../lib/slugify.js';
import type { CreateBlogTagInput } from './blog-tags.schema.js';

export function listBlogTags(prisma: PrismaClient) {
  return prisma.blogTag.findMany({ orderBy: { name: 'asc' } });
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
