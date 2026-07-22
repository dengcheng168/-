import type { MetadataRoute } from 'next';
import { listProducts, listProductCategories } from '@/lib/api/products';
import { listBlogPosts } from '@/lib/api/blog';
import { absoluteUrl } from '@/lib/seo/site';
import { localeHref } from '@/lib/i18n/paths';

const staticPaths = [
  '',
  '/products',
  '/oem-odm',
  '/factory',
  '/certificates',
  '/about',
  '/blog',
  '/faq',
  '/contact',
  '/privacy-policy',
  '/terms-of-use',
];

/** 每个英文路径生成一条 en 条目和一条 es 条目，互相通过 alternates.languages 关联。 */
function bilingualEntry(
  path: string,
  extra: Pick<MetadataRoute.Sitemap[number], 'changeFrequency' | 'priority'>,
): MetadataRoute.Sitemap {
  const enUrl = absoluteUrl(path);
  // localeHref 只认 '/' 开头的路径（空字符串会被当成外部链接原样返回，见 lib/i18n/paths.ts
  // 的注释），首页在这份 sitemap 里用 '' 表示，所以调用前要先规整成 '/'
  const esUrl = absoluteUrl(localeHref(path === '' ? '/' : path, 'es'));
  const languages = { en: enUrl, es: esUrl, 'x-default': enUrl };
  return [
    { url: enUrl, alternates: { languages }, ...extra },
    { url: esUrl, alternates: { languages }, ...extra },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, posts] = await Promise.all([
    listProductCategories(),
    listProducts({ pageSize: 100 }),
    listBlogPosts({ pageSize: 100 }),
  ]);

  const entries: MetadataRoute.Sitemap = staticPaths.flatMap((path) =>
    bilingualEntry(path, { changeFrequency: path === '' ? 'daily' : 'weekly', priority: path === '' ? 1 : 0.7 }),
  );

  for (const category of categories) {
    entries.push(...bilingualEntry(`/products/category/${category.slug}`, { changeFrequency: 'weekly', priority: 0.6 }));
  }
  for (const product of products.items) {
    entries.push(...bilingualEntry(`/products/${product.slug}`, { changeFrequency: 'weekly', priority: 0.6 }));
  }
  for (const post of posts.items) {
    entries.push(...bilingualEntry(`/blog/${post.slug}`, { changeFrequency: 'monthly', priority: 0.5 }));
  }

  return entries;
}
