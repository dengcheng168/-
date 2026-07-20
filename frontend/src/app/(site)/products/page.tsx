import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CategoryFilterSidebar } from '@/components/product/CategoryFilterSidebar';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Pagination } from '@/components/ui/Pagination';
import { PageHeroBanner } from '@/components/site/PageHeroBanner';
import { listProducts, listProductCategories } from '@/lib/api/products';
import { getPageBySlug } from '@/lib/api/content';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse our full range of OEM/ODM water purifier products.',
  alternates: { canonical: '/products' },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const currentPage = Number(pageParam) || 1;

  const [{ items, meta }, categories, pageContent] = await Promise.all([
    listProducts({ page: currentPage, pageSize: 12 }),
    listProductCategories(),
    getPageBySlug('products'),
  ]);
  const hasHero = Boolean(pageContent?.heroImage);

  return (
    <>
      {hasHero && <PageHeroBanner image={pageContent!.heroImage!} title="Products" />}

      <Container className="py-12">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Products' }]} />
        {!hasHero && <h1 className="mt-4 text-3xl font-semibold text-navy-950">Products</h1>}

        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside>
            <CategoryFilterSidebar categories={categories} />
          </aside>
          <div>
            <ProductGrid products={items} />
            <Pagination page={meta?.page ?? 1} totalPages={meta?.totalPages ?? 1} basePath="/products" />
          </div>
        </div>
      </Container>
    </>
  );
}
