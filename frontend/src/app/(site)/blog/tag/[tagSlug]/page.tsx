import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { BlogCard } from '@/components/blog/BlogCard';
import { Pagination } from '@/components/ui/Pagination';
import { listBlogPosts, listBlogCategories, listBlogTags } from '@/lib/api/blog';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tagSlug: string }>;
}): Promise<Metadata> {
  const { tagSlug } = await params;
  return { alternates: { canonical: `/blog/tag/${tagSlug}` } };
}

export default async function BlogTagPage({
  params,
  searchParams,
}: {
  params: Promise<{ tagSlug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { tagSlug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;

  const [{ items, meta }, categories, tags] = await Promise.all([
    listBlogPosts({ tag: tagSlug, page, pageSize: 9 }),
    listBlogCategories(),
    listBlogTags(),
  ]);

  const tag = tags.find((t) => t.slug === tagSlug);

  return (
    <Container className="py-12">
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }, { label: tag?.name ?? tagSlug }]}
      />
      <h1 className="mt-4 text-3xl font-semibold text-navy-950">Tag: {tag?.name ?? tagSlug}</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <BlogSidebar categories={categories} tags={tags} activeTagSlug={tagSlug} />
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
          <Pagination page={meta?.page ?? 1} totalPages={meta?.totalPages ?? 1} basePath={`/blog/tag/${tagSlug}`} />
        </div>
      </div>
    </Container>
  );
}
