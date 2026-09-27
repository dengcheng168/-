import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ProductGrid } from '@/components/product/ProductGrid';
import { BlogCard } from '@/components/blog/BlogCard';
import { searchSite } from '@/lib/api/search';

export const metadata: Metadata = { title: 'Buscar', robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams;
  const { products, posts } = await searchSite(q, 'es');
  return (
    <Container className="py-12">
      <Breadcrumbs items={[{ label: 'Inicio', href: '/es' }, { label: 'Buscar' }]} />
      <h1 className="mt-4 text-3xl font-semibold text-navy-950">Resultados de búsqueda</h1>
      {q && <p className="mt-2 text-grey-500">Resultados para «{q}»</p>}
      {!q ? <p className="mt-10 text-grey-500">Introduce un término para buscar productos y artículos.</p>
        : !products.length && !posts.length ? <p className="mt-10 text-grey-500">No se encontraron resultados.</p> : null}
      {products.length > 0 && <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-navy-950">Productos</h2>
        <ProductGrid products={products} locale="es" />
      </section>}
      {posts.length > 0 && <section className="mt-10">
        <h2 className="text-lg font-semibold text-navy-950">Artículos</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => <BlogCard key={post.id} post={post} locale="es" />)}
        </div>
      </section>}
    </Container>
  );
}
