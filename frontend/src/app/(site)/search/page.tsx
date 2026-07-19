import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ProductGrid } from '@/components/product/ProductGrid';
import { BlogCard } from '@/components/blog/BlogCard';
import { searchSite } from '@/lib/api/search';

export const metadata: Metadata = {
  title: 'Search',
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = '' } = await searchParams;
  const { products, posts } = await searchSite(q);
  const hasResults = products.length > 0 || posts.length > 0;

  return (
    <Container className="py-12">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Search' }]} />
      <h1 className="mt-4 text-3xl font-semibold text-navy-950">Search Results</h1>
      {q && <p className="mt-2 text-grey-500">Showing results for &ldquo;{q}&rdquo;</p>}

      {!q ? (
        <p className="mt-10 text-grey-500">Enter a search term to find products and articles.</p>
      ) : !hasResults ? (
        <p className="mt-10 text-grey-500">No results found.</p>
      ) : (
        <>
          {products.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-semibold text-navy-950">Products</h2>
              <div className="mt-4">
                <ProductGrid products={products} />
              </div>
            </section>
          )}
          {posts.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-semibold text-navy-950">Articles</h2>
              <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </Container>
  );
}
