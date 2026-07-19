import type { PrismaClient, Prisma } from '@prisma/client';
import { fromJsonString, toJsonString } from '../../lib/json.js';
import { sanitizeRichText } from '../../lib/sanitize.js';
import type { UpdatePageInput } from './pages.schema.js';

function serializePage<T extends { sections: string | null }>(page: T) {
  return { ...page, sections: fromJsonString(page.sections, null) };
}

export async function listPages(prisma: PrismaClient) {
  const pages = await prisma.page.findMany({ orderBy: { slug: 'asc' } });
  return pages.map(serializePage);
}

export async function getPageBySlug(prisma: PrismaClient, slug: string) {
  const page = await prisma.page.findUnique({ where: { slug } });
  return page ? serializePage(page) : null;
}

export async function updatePage(prisma: PrismaClient, slug: string, input: UpdatePageInput) {
  const { sections, bodyHtml, ...rest } = input;
  const page = await prisma.page.update({
    where: { slug },
    data: {
      ...rest,
      ...(bodyHtml !== undefined ? { bodyHtml: sanitizeRichText(bodyHtml) } : {}),
      ...(sections !== undefined ? { sections: toJsonString(sections) } : {}),
    } as Prisma.PageUpdateInput,
  });
  return serializePage(page);
}
