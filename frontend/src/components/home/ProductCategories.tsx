import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { ProductCategory } from '@/types/product';

export function ProductCategories({ categories }: { categories: ProductCategory[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="bg-grey-50 py-16">
      <Container>
        <SectionHeading eyebrow="Our Range" title="Product Categories" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products/category/${category.slug}`}
              className="group relative flex h-56 items-end overflow-hidden rounded-lg bg-navy-900"
            >
              {category.image && (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="object-cover opacity-70 transition-transform duration-300 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 to-transparent" />
              <div className="relative z-10 p-5">
                <h3 className="text-lg font-semibold text-white">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
