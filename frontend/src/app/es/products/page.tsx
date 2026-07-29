import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CategoryFilterSidebar } from '@/components/product/CategoryFilterSidebar';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Pagination } from '@/components/ui/Pagination';
import { PageHeroBanner } from '@/components/site/PageHeroBanner';
import { listProducts, listProductCategories } from '@/lib/api/products';
import { getPageBySlug } from '@/lib/api/content';
import { t } from '@/lib/i18n/site-strings';

export const metadata: Metadata = {
  title: t('es', 'productsPageTitle'),
  description: t('es', 'productsPageDescription'),
  alternates: {
    canonical: '/es/products',
    languages: { en: '/products', es: '/es/products', 'x-default': '/products' },
  },
};

export default async function SpanishProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const currentPage = Number(pageParam) || 1;

  const [{ items, meta }, categories, pageContent] = await Promise.all([
    listProducts({ page: currentPage, pageSize: 12 }, 'es'),
    listProductCategories('es'),
    getPageBySlug('products', 'es'),
  ]);
  const hasHero = Boolean(pageContent?.heroImage || pageContent?.heroImageMobile);

  return (
    <>
      {hasHero && (
        <PageHeroBanner image={pageContent?.heroImage} imageMobile={pageContent?.heroImageMobile} title={pageContent?.title ?? t('es', 'productsPageTitle')}>
          {pageContent?.bodyHtml && (
            <div
              className="prose prose-sm prose-invert mt-4 max-w-2xl text-grey-100/90"
              dangerouslySetInnerHTML={{ __html: pageContent.bodyHtml }}
            />
          )}
        </PageHeroBanner>
      )}

      <Container className="py-12">
        <Breadcrumbs items={[{ label: t('es', 'breadcrumbHome'), href: '/es' }, { label: t('es', 'breadcrumbProducts') }]} locale="es" />
        {!hasHero && (
          <>
            <h1 className="mt-4 text-3xl font-semibold text-navy-950">{pageContent?.title ?? t('es', 'productsPageTitle')}</h1>
            {pageContent?.bodyHtml && (
              <div
                className="prose prose-sm mt-4 max-w-2xl text-grey-500"
                dangerouslySetInnerHTML={{ __html: pageContent.bodyHtml }}
              />
            )}
          </>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside>
            <CategoryFilterSidebar categories={categories} locale="es" />
          </aside>
          <div>
            <ProductGrid products={items} locale="es" />
            <Pagination page={meta?.page ?? 1} totalPages={meta?.totalPages ?? 1} basePath="/es/products" locale="es" />
          </div>
        </div>
      </Container>
    </>
  );
}
