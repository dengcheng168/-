import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CategoryFilterSidebar } from '@/components/product/CategoryFilterSidebar';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Pagination } from '@/components/ui/Pagination';
import { listProducts, listProductCategories } from '@/lib/api/products';

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
  const page = Number(pageParam) || 1;

  const [{ items, meta }, categories] = await Promise.all([
    listProducts({ page, pageSize: 12 }),
    listProductCategories(),
  ]);

  return (
    <Container className="py-12">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Products' }]} />
      <h1 className="mt-4 text-3xl font-semibold text-navy-950">Products</h1>

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
  );
}
