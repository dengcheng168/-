'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ProductImage } from '@/types/product';

export function ProductGallery({ mainImage, images, name }: { mainImage: string; images: ProductImage[]; name: string }) {
  const allImages: ProductImage[] = [{ url: mainImage, alt: name }, ...images];
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-grey-200 bg-grey-50">
        <Image
          src={allImages[active]?.url ?? mainImage}
          alt={allImages[active]?.alt ?? name}
          fill
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-cover"
          priority
        />
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
