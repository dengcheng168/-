import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo/site';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = await getSiteUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/search'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
