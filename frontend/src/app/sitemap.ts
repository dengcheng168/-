import type { MetadataRoute } from 'next';
import { listProducts, listProductCategories } from '@/lib/api/products';
import { listBlogPosts } from '@/lib/api/blog';
import { getSiteUrl } from '@/lib/seo/site';

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const [categories, products, posts] = await Promise.all([
    listProductCategories(),
    listProducts({ pageSize: 100 }),
    listBlogPosts({ pageSize: 100 }),
  ]);

  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));

  for (const category of categories) {
    entries.push({ url: `${siteUrl}/products/category/${category.slug}`, changeFrequency: 'weekly', priority: 0.6 });
  }
  for (const product of products.items) {
    entries.push({ url: `${siteUrl}/products/${product.slug}`, changeFrequency: 'weekly', priority: 0.6 });
  }
  for (const post of posts.items) {
    entries.push({ url: `${siteUrl}/blog/${post.slug}`, changeFrequency: 'monthly', priority: 0.5 });
  }

  return entries;
}
