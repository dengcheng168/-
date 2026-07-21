import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { BlogCard } from '@/components/blog/BlogCard';
import { Pagination } from '@/components/ui/Pagination';
import { PageHeroBanner } from '@/components/site/PageHeroBanner';
import { listBlogPosts, listBlogCategories, listBlogTags } from '@/lib/api/blog';
import { getPageBySlug } from '@/lib/api/content';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'News and insights from our water purifier factory.',
  alternates: { canonical: '/blog' },
};

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
      {hasHero && <PageHeroBanner image={pageContent?.heroImage} imageMobile={pageContent?.heroImageMobile} title="Blog" />}

      <Container className="py-12">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Blog' }]} />
        {!hasHero && <h1 className="mt-4 text-3xl font-semibold text-navy-950">Blog</h1>}

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
