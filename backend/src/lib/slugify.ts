export function slugify(input: string): string {
  return input
    .toString()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

/**
 * 生成唯一 slug：若基础 slug 已存在，则依次尝试 slug-2, slug-3 ...
 * `exists` 由调用方传入具体的查重逻辑（不同 model 查询不同的表）。
 */
export async function generateUniqueSlug(
  base: string,
  exists: (candidate: string) => Promise<boolean>,
): Promise<string> {
  const baseSlug = slugify(base) || 'item';
  let candidate = baseSlug;
  let suffix = 2;

  while (await exists(candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}
