import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CategoryFilterSidebar } from '@/components/product/CategoryFilterSidebar';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Pagination } from '@/components/ui/Pagination';
import { getProductCategoryBySlug, listVisibleProductCategories } from '@/lib/api/products';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}): Promise<Metadata> {
  const { categorySlug } = await params;
  const result = await getProductCategoryBySlug(categorySlug);
  if (!result) return {};

  return {
    title: result.category.seoTitle ?? result.category.name,
    description: result.category.seoDescription ?? result.category.description ?? undefined,
    alternates: {
      canonical: `/products/category/${categorySlug}`,
      languages: {
        en: `/products/category/${categorySlug}`,
        es: `/es/products/category/${categorySlug}`,
        'x-default': `/products/category/${categorySlug}`,
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

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
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
