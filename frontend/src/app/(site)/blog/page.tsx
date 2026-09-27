import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { BlogCard } from '@/components/blog/BlogCard';
import { Pagination } from '@/components/ui/Pagination';
import { PageHeroBanner } from '@/components/site/PageHeroBanner';
import { listBlogPosts, listBlogCategories, listBlogTags } from '@/lib/api/blog';
import { getPageBySlug } from '@/lib/api/content';
import { paginatedDescription, paginatedPath, paginatedTitle } from '@/lib/seo/pagination';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
  const { page: pageParam } = await searchParams;
  const page = await getPageBySlug('blog');
  const baseTitle = page?.seoTitle ?? page?.title ?? 'Blog';
  const baseDescription = page?.seoDescription ?? 'News and insights from our water purifier factory.';
  const enPath = paginatedPath('/blog', pageParam);
  const esPath = paginatedPath('/es/blog', pageParam);
  return {
    title: paginatedTitle(baseTitle, pageParam),
    description: paginatedDescription(baseDescription, pageParam),
    alternates: { canonical: enPath, languages: { en: enPath, es: esPath, 'x-default': enPath } },
  };
}

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;

  const [{ items, meta }, categories, tags, pageContent] = await Promise.all([
    listBlogPosts({ page, pageSize: 9 }),
    listBlogCategories(),
    listBlogTags(),
    getPageBySlug('blog'),
  ]);
  const hasHero = Boolean(pageContent?.heroImage || pageContent?.heroImageMobile);

  return (
    <>
      {hasHero && (
        <PageHeroBanner image={pageContent?.heroImage} imageMobile={pageContent?.heroImageMobile} title={pageContent?.title ?? 'Blog'}>
          {pageContent?.bodyHtml && (
            <div
              className="prose prose-sm prose-invert mt-4 max-w-2xl text-grey-100/90"
              dangerouslySetInnerHTML={{ __html: pageContent.bodyHtml }}
            />
          )}
        </PageHeroBanner>
      )}

      <Container className="py-12">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Blog' }]} />
        {!hasHero && (
          <>
            <h1 className="mt-4 text-3xl font-semibold text-navy-950">{pageContent?.title ?? 'Blog'}</h1>
            {pageContent?.bodyHtml && (
              <div
                className="prose prose-sm mt-4 max-w-2xl text-grey-500"
                dangerouslySetInnerHTML={{ __html: pageContent.bodyHtml }}
              />
            )}
          </>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
          <BlogSidebar categories={categories} tags={tags} />
          <div>
            {items.length === 0 ? (
              <p className="py-12 text-center text-grey-500">No articles found.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}
            <Pagination page={meta?.page ?? 1} totalPages={meta?.totalPages ?? 1} basePath="/blog" />
          </div>
        </div>
      </Container>
    </>
  );
}
