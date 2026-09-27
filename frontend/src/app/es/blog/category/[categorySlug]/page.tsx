import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { BlogCard } from '@/components/blog/BlogCard';
import { Pagination } from '@/components/ui/Pagination';
import { listBlogPosts, listBlogCategories, listBlogTags } from '@/lib/api/blog';
import { t } from '@/lib/i18n/site-strings';
import { paginatedPath } from '@/lib/seo/pagination';

export async function generateMetadata({
  params, searchParams,
}: {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { categorySlug } = await params;
  const { page } = await searchParams;
  const categories = await listBlogCategories('es');
  const name = categories.find((category) => category.slug === categorySlug)?.name ?? categorySlug;
  const enPath = paginatedPath(`/blog/category/${categorySlug}`, page);
  const esPath = paginatedPath(`/es/blog/category/${categorySlug}`, page);
  return {
    title: `${name} | Blog de Li-Men`,
    description: `Artículos del blog de Li-Men en la categoría ${name}.`,
    robots: { index: false, follow: true },
    alternates: {
      canonical: esPath,
      languages: {
        en: enPath,
        es: esPath,
        'x-default': enPath,
      },
    },
  };
}

export default async function SpanishBlogCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { categorySlug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;

  const [{ items, meta }, categories, tags] = await Promise.all([
    listBlogPosts({ category: categorySlug, page, pageSize: 9 }, 'es'),
    listBlogCategories('es'),
    listBlogTags(),
  ]);

  const category = categories.find((c) => c.slug === categorySlug);
  if (!category || items.length === 0) notFound();

  return (
    <Container className="py-12">
      <Breadcrumbs
        items={[
          { label: t('es', 'breadcrumbHome'), href: '/es' },
          { label: t('es', 'breadcrumbBlog'), href: '/es/blog' },
          { label: category?.name ?? categorySlug },
        ]}
        locale="es"
      />
      <h1 className="mt-4 text-3xl font-semibold text-navy-950">{category?.name ?? t('es', 'blogPageTitle')}</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <BlogSidebar categories={categories} tags={tags} activeCategorySlug={categorySlug} locale="es" />
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
          <Pagination
            page={meta?.page ?? 1}
            totalPages={meta?.totalPages ?? 1}
            basePath={`/es/blog/category/${categorySlug}`}
            locale="es"
          />
        </div>
      </div>
    </Container>
  );
}
