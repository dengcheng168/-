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
      <div className="relative mx-auto aspect-square max-h-[500px] w-full overflow-hidden rounded-lg border border-grey-200 bg-white min-[1440px]:max-h-[560px]">
        <Image
          src={allImages[active]?.url ?? mainImage}
          alt={allImages[active]?.alt ?? name}
          fill
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-contain"
          priority
        />
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() => goTo(-1)}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-navy-950 shadow transition-colors hover:bg-white"
            >
              &lsaquo;
            </button>
            <button
              type="button"
              onClick={() => goTo(1)}
              aria-label="Next image"
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-navy-950 shadow transition-colors hover:bg-white"
            >
              &rsaquo;
            </button>
          </>
        )}
      </div>
      {allImages.length > 1 && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1" aria-label="Product thumbnails">
          {allImages.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`${name} image ${i + 1}`}
              aria-current={active === i ? 'true' : undefined}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                active === i ? 'border-water-500' : 'border-grey-200 hover:border-grey-300'
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
