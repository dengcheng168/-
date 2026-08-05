export interface NavigableProduct {
  slug: string;
  categoryId: number;
}

export interface AdjacentProducts<T> {
  prev: T | null;
  next: T | null;
}

/**
 * 上一款/下一款优先在同分类内查找（按调用方传入的 allProducts 原有顺序，即后台
 * sortOrder/id 排序），只有当前产品所在分类只有它自己一条时才回退到全站顺序。
 * allProducts 必须已经是「已发布 + 当前语言」的列表（由 listProducts 保证），
 * 这里不重复做发布状态或语言过滤。
 */
export function getAdjacentProducts<T extends NavigableProduct>(
  current: NavigableProduct,
  allProducts: T[],
): AdjacentProducts<T> {
  const sameCategory = allProducts.filter((p) => p.categoryId === current.categoryId);
  const pool = sameCategory.length > 1 ? sameCategory : allProducts;
  const index = pool.findIndex((p) => p.slug === current.slug);

  if (index === -1) return { prev: null, next: null };

  return {
    prev: index > 0 ? pool[index - 1]! : null,
    next: index < pool.length - 1 ? pool[index + 1]! : null,
  };
}
