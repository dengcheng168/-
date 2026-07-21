import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { BlogCard } from '@/components/blog/BlogCard';
import { Pagination } from '@/components/ui/Pagination';
import { PageHeroBanner } from '@/components/site/PageHeroBanner';
import { listBlogPosts, listBlogCategories, listBlogTags } from '@/lib/api/blog';
import { getPageBySlug } from '@/lib/api/content';
import { t } from '@/lib/i18n/site-strings';

export const metadata: Metadata = {
  title: t('es', 'blogPageTitle'),
  description: t('es', 'blogPageDescription'),
  alternates: { canonical: '/es/blog', languages: { en: '/blog', es: '/es/blog' } },
};

export default async function SpanishBlogListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;

  const [{ items, meta }, categories, tags, pageContent] = await Promise.all([
    listBlogPosts({ page, pageSize: 9 }, 'es'),
    listBlogCategories('es'),
    listBlogTags(),
    getPageBySlug('blog', 'es'),
  ]);
  const hasHero = Boolean(pageContent?.heroImage || pageContent?.heroImageMobile);

  return (
    <>
      {hasHero && (
        <PageHeroBanner image={pageContent?.heroImage} imageMobile={pageContent?.heroImageMobile} title={t('es', 'blogPageTitle')} />
      )}

      <Container className="py-12">
        <Breadcrumbs items={[{ label: t('es', 'breadcrumbHome'), href: '/es' }, { label: t('es', 'breadcrumbBlog') }]} />
        {!hasHero && <h1 className="mt-4 text-3xl font-semibold text-navy-950">{t('es', 'blogPageTitle')}</h1>}

        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
          <BlogSidebar categories={categories} tags={tags} locale="es" />
          <div>
            {items.length === 0 ? (
              <p className="py-12 text-center text-grey-500">{t('es', 'noArticlesFound')}</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((post) => (
                  <BlogCard key={post.id} post={post} locale="es" />
                ))}
              </div>
            )}
            <Pagination page={meta?.page ?? 1} totalPages={meta?.totalPages ?? 1} basePath="/es/blog" />
          </div>
        </div>
      </Container>
    </>
  );
}
