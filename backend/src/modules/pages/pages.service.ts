import type { PrismaClient, Prisma, PageTranslation } from '@prisma/client';
import { fromJsonString, toJsonString } from '../../lib/json.js';
import { sanitizeRichText } from '../../lib/sanitize.js';
import type { UpdatePageInput, UpsertPageTranslationInput } from './pages.schema.js';

function serializePage<T extends { sections: string | null }>(page: T) {
  return { ...page, sections: fromJsonString(page.sections, null) };
}

function serializePageTranslation(translation: PageTranslation) {
  return { ...translation, sections: fromJsonString<unknown>(translation.sections, null) };
}

export async function listPages(prisma: PrismaClient) {
  const pages = await prisma.page.findMany({ orderBy: { slug: 'asc' } });
  return pages.map(serializePage);
}

export async function getPageBySlug(prisma: PrismaClient, slug: string, locale?: string) {
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) return null;
  const base = serializePage(page);
  if (!locale) return base;

  const translation = await prisma.pageTranslation.findUnique({
    where: { pageId_locale: { pageId: page.id, locale } },
  });
  const published = translation && translation.translationStatus === 'PUBLISHED';
  return { ...base, translation: published ? serializePageTranslation(translation) : null };
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

/** 翻译表用 pageId 关联，但路由沿用这个模块一直用的 slug 寻址，这里先按 slug 查出 id 再操作 */
export async function getPageTranslationBySlug(prisma: PrismaClient, slug: string, locale: string) {
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) return undefined;
  const translation = await prisma.pageTranslation.findUnique({
    where: { pageId_locale: { pageId: page.id, locale } },
  });
  return translation ? serializePageTranslation(translation) : null;
}

export async function upsertPageTranslationBySlug(
  prisma: PrismaClient,
  slug: string,
  locale: string,
  input: UpsertPageTranslationInput,
  updatedBy?: number,
) {
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) return undefined;

  const { sections, bodyHtml, ...rest } = input;
  const data = {
    ...rest,
    ...(bodyHtml !== undefined ? { bodyHtml: sanitizeRichText(bodyHtml) } : {}),
    ...(sections !== undefined ? { sections: toJsonString(sections) } : {}),
    updatedBy,
  };
  const translation = await prisma.pageTranslation.upsert({
    where: { pageId_locale: { pageId: page.id, locale } },
    create: { pageId: page.id, locale, ...data },
    update: data,
  });
  return serializePageTranslation(translation);
}
