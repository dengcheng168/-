import Link from 'next/link';
import type { ProductCategory } from '@/types/product';

export function CategoryFilterSidebar({
  categories,
  activeSlug,
}: {
  categories: ProductCategory[];
  activeSlug?: string;
}) {
  return (
    <nav aria-label="Product categories" className="space-y-1">
      <Link
        href="/products"
        className={`block rounded-md px-3 py-2 text-sm font-medium ${
          !activeSlug ? 'bg-navy-900 text-white' : 'text-navy-900 hover:bg-grey-100'
        }`}
      >
        All Products
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/products/category/${category.slug}`}
          className={`block rounded-md px-3 py-2 text-sm font-medium ${
            activeSlug === category.slug ? 'bg-navy-900 text-white' : 'text-navy-900 hover:bg-grey-100'
          }`}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
