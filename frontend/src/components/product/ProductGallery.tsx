'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ProductImage } from '@/types/product';

export function ProductGallery({ mainImage, images, name }: { mainImage: string; images: ProductImage[]; name: string }) {
  const allImages: ProductImage[] = [{ url: mainImage, alt: name }, ...images];
  const [active, setActive] = useState(0);
  const hasMultiple = allImages.length > 1;

  function goTo(delta: number) {
    setActive((prev) => (prev + delta + allImages.length) % allImages.length);
  }

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-grey-200 bg-grey-50">
        <Image
          src={allImages[active]?.url ?? mainImage}
          alt={allImages[active]?.alt ?? name}
          fill
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-cover object-top"
          priority
        />
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() => goTo(-1)}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-navy-950 shadow hover:bg-white"
            >
              &lsaquo;
            </button>
            <button
              type="button"
              onClick={() => goTo(1)}
              aria-label="Next image"
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-navy-950 shadow hover:bg-white"
            >
              &rsaquo;
            </button>
          </>
        )}
      </div>
      {allImages.length > 1 && (
        <div className="mt-4 flex gap-3">
          {allImages.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 overflow-hidden rounded-md border-2 ${
                active === i ? 'border-water-500' : 'border-grey-200'
              }`}
            >
              <Image src={img.url} alt={img.alt ?? name} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
