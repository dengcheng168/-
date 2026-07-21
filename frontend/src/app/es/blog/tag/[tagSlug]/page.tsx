import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { BlogCard } from '@/components/blog/BlogCard';
import { Pagination } from '@/components/ui/Pagination';
import { listBlogPosts, listBlogCategories, listBlogTags } from '@/lib/api/blog';
import { t } from '@/lib/i18n/site-strings';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tagSlug: string }>;
}): Promise<Metadata> {
  const { tagSlug } = await params;
  return {
    alternates: {
      canonical: `/es/blog/tag/${tagSlug}`,
      languages: { en: `/blog/tag/${tagSlug}`, es: `/es/blog/tag/${tagSlug}` },
    },
  };
}

export default async function SpanishBlogTagPage({
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
    listBlogPosts({ tag: tagSlug, page, pageSize: 9 }, 'es'),
    listBlogCategories('es'),
    listBlogTags(),
  ]);

  const tag = tags.find((t2) => t2.slug === tagSlug);

  return (
    <Container className="py-12">
      <Breadcrumbs
        items={[
          { label: t('es', 'breadcrumbHome'), href: '/es' },
          { label: t('es', 'breadcrumbBlog'), href: '/es/blog' },
          { label: tag?.name ?? tagSlug },
        ]}
      />
      <h1 className="mt-4 text-3xl font-semibold text-navy-950">
        {t('es', 'tagPrefix')} {tag?.name ?? tagSlug}
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <BlogSidebar categories={categories} tags={tags} activeTagSlug={tagSlug} locale="es" />
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
          <Pagination page={meta?.page ?? 1} totalPages={meta?.totalPages ?? 1} basePath={`/es/blog/tag/${tagSlug}`} />
        </div>
      </div>
    </Container>
  );
}
