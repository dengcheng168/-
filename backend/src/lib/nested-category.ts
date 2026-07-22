import type { PrismaClient } from '@prisma/client';

interface CategoryLike {
  id: number;
  name: string;
  description?: string | null;
}

interface CategoryTranslationLike {
  name: string | null;
  description?: string | null;
}

/**
 * 产品/文章列表、详情、相关推荐里都会内嵌一份 category 关联对象（用于卡片小标签、
 * 面包屑等）。这份对象是 Prisma include 出来的原始英文记录，不会被 attachProductTranslations
 * /attachPostTranslations 覆盖——那两个函数只处理产品/文章自己的字段，不知道 category 的存在。
 * 这里单独批量查一次对应 locale 下已发布的分类翻译，贴到每个 item.category 上。
 *
 * 空字符串/纯空格译文视为"未翻译"，不覆盖英文原文——跟 resolveLocalizedEntity 的规则一致。
 */
export function overlayCategoryName<T extends CategoryLike>(category: T, translation: CategoryTranslationLike | undefined): T {
  if (!translation) return category;
  const next = { ...category };
  if (typeof translation.name === 'string' && translation.name.trim() !== '') {
    next.name = translation.name;
  }
  if (
    'description' in next &&
    typeof translation.description === 'string' &&
    translation.description.trim() !== ''
  ) {
    next.description = translation.description;
  }
  return next;
}

/**
 * 批量把一批产品各自内嵌的 category.name 翻译成对应 locale——用一次 IN 查询覆盖整批，
 * 不是每个产品单独查一次，避免 N+1。不传 locale（英文默认路径）完全不查，零额外开销。
 */
export async function attachNestedProductCategoryTranslations<
  T extends { category?: CategoryLike | null },
>(prisma: PrismaClient, items: T[], locale: string | undefined): Promise<T[]> {
  if (!locale || items.length === 0) return items;
  const categoryIds = [...new Set(items.map((i) => i.category?.id).filter((id): id is number => id != null))];
  if (categoryIds.length === 0) return items;

  const rows = await prisma.productCategoryTranslation.findMany({
    where: { categoryId: { in: categoryIds }, locale, translationStatus: 'PUBLISHED' },
  });
  const byId = new Map(rows.map((r) => [r.categoryId, r]));

  return items.map((item) => ({
    ...item,
    category: item.category ? overlayCategoryName(item.category, byId.get(item.category.id)) : item.category,
  }));
}

/** 同上，针对文章的 category（BlogCategoryTranslation） */
export async function attachNestedBlogCategoryTranslations<
  T extends { category?: CategoryLike | null },
>(prisma: PrismaClient, items: T[], locale: string | undefined): Promise<T[]> {
  if (!locale || items.length === 0) return items;
  const categoryIds = [...new Set(items.map((i) => i.category?.id).filter((id): id is number => id != null))];
  if (categoryIds.length === 0) return items;

  const rows = await prisma.blogCategoryTranslation.findMany({
    where: { categoryId: { in: categoryIds }, locale, translationStatus: 'PUBLISHED' },
  });
  const byId = new Map(rows.map((r) => [r.categoryId, r]));

  return items.map((item) => ({
    ...item,
    category: item.category ? overlayCategoryName(item.category, byId.get(item.category.id)) : item.category,
  }));
}
