import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CategoryFilterSidebar } from '@/components/product/CategoryFilterSidebar';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Pagination } from '@/components/ui/Pagination';
import { CategoryBuyerGuide } from '@/components/product/CategoryBuyerGuide';
import { getProductCategoryBySlug, listVisibleProductCategories } from '@/lib/api/products';
import { paginatedDescription, paginatedPath, paginatedTitle } from '@/lib/seo/pagination';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { categorySlug } = await params;
  const { page: pageParam } = await searchParams;
  const result = await getProductCategoryBySlug(categorySlug);
  if (!result) return {};
  const enPath = paginatedPath(`/products/category/${categorySlug}`, pageParam);
  const esPath = paginatedPath(`/es/products/category/${categorySlug}`, pageParam);

  return {
    title: paginatedTitle(result.category.seoTitle ?? result.category.name, pageParam),
    description: paginatedDescription(result.category.seoDescription ?? result.category.description ?? undefined, pageParam),
    alternates: {
      canonical: enPath,
      languages: {
        en: enPath,
        es: esPath,
        'x-default': enPath,
      },
    },
    // 分类当前没有任何已发布产品时不参与索引，但仍允许爬虫顺着链接继续走——
    // 页面本身不删除，只是不让空分类占搜索结果位
    ...(result.products.length === 0 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ProductCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { categorySlug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;

  const [result, categories] = await Promise.all([
    getProductCategoryBySlug(categorySlug, { page, pageSize: 12 }),
    listVisibleProductCategories(),
  ]);

  if (!result) notFound();

  return (
    <Container className="py-12">
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'Products', href: '/products' }, { label: result.category.name }]}
      />
      <h1 className="mt-4 text-3xl font-semibold text-navy-950">{result.category.name}</h1>
      {result.category.description && <p className="mt-3 max-w-2xl text-grey-500">{result.category.description}</p>}
      <CategoryBuyerGuide slug={categorySlug} />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <aside>
          <CategoryFilterSidebar categories={categories} activeSlug={categorySlug} />
        </aside>
        <div>
          <ProductGrid products={result.products} />
          <Pagination
            page={result.meta?.page ?? 1}
            totalPages={result.meta?.totalPages ?? 1}
            basePath={`/products/category/${categorySlug}`}
          />
        </div>
      </div>
    </Container>
  );
}
