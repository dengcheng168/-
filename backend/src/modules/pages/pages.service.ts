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

/**
 * sections 字段兼两种用途：Factory/OEM-ODM 页面存结构化 JSON（对象/数组，不经过富文本清洗，
 * 因为从不作为 HTML 渲染）；About 等页面存一段自由 HTML 字符串（用于后台"补充内容"区块，
 * 前台走 dangerouslySetInnerHTML 渲染），这种情况必须和 bodyHtml 一样过 sanitizeRichText，
 * 否则就是一个绕过 XSS 白名单的漏洞。
 */
function sanitizeSections(sections: unknown): unknown {
  return typeof sections === 'string' ? sanitizeRichText(sections) : sections;
}

export async function updatePage(prisma: PrismaClient, slug: string, input: UpdatePageInput) {
  const { sections, bodyHtml, ...rest } = input;
  const page = await prisma.page.update({
    where: { slug },
    data: {
      ...rest,
      ...(bodyHtml !== undefined ? { bodyHtml: sanitizeRichText(bodyHtml) } : {}),
      ...(sections !== undefined ? { sections: toJsonString(sanitizeSections(sections)) } : {}),
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
    ...(sections !== undefined ? { sections: toJsonString(sanitizeSections(sections)) } : {}),
    updatedBy,
  };
  const translation = await prisma.pageTranslation.upsert({
    where: { pageId_locale: { pageId: page.id, locale } },
    create: { pageId: page.id, locale, ...data },
    update: data,
  });
  return serializePageTranslation(translation);
}
