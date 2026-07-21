import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types/product';
import type { Locale } from '@/lib/i18n/locales';
import { localeHref } from '@/lib/i18n/paths';

export function ProductCard({ product, locale = 'en' }: { product: Product; locale?: Locale }) {
  return (
    <Link
      href={localeHref(`/products/${product.slug}`, locale)}
      className="group flex flex-col overflow-hidden rounded-lg border border-grey-200 bg-white transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-grey-50">
        <Image
          src={product.mainImage}
          alt={product.galleryImages[0]?.alt ?? product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        {product.category && (
          <span className="text-xs font-medium uppercase tracking-wide text-water-600">
            {product.category.name}
          </span>
        )}
        <h3 className="mt-1 text-base font-semibold text-navy-950">{product.name}</h3>
        {product.shortDescription && (
          <p className="mt-2 line-clamp-2 text-sm text-grey-500">{product.shortDescription}</p>
        )}
      </div>
    </Link>
  );
}
