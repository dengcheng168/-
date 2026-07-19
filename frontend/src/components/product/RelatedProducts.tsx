import { SectionHeading } from '@/components/ui/SectionHeading';
import { ProductGrid } from './ProductGrid';
import type { Product } from '@/types/product';

export function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="mt-16">
      <SectionHeading title="Related Products" align="left" />
      <div className="mt-6">
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
