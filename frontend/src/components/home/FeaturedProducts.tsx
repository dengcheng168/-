import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/Button';
import type { Product } from '@/types/product';

export function FeaturedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="py-16">
      <Container>
        <SectionHeading eyebrow="Best Sellers" title="Featured Products" />
        <div className="mt-10">
          <ProductGrid products={products} />
        </div>
        <div className="mt-10 text-center">
          <Button href="/products" variant="outline">
            View All Products
          </Button>
        </div>
      </Container>
    </section>
  );
}
