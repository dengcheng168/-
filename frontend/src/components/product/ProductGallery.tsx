'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import type { ProductImage } from '@/types/product';

function ChevronUpIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M3 10l5-5 5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProductGallery({ mainImage, images, name }: { mainImage: string; images: ProductImage[]; name: string }) {
  const allImages: ProductImage[] = [{ url: mainImage, alt: name }, ...images];
  const [active, setActive] = useState(0);
  const hasMultiple = allImages.length > 1;
  const thumbListRef = useRef<HTMLDivElement>(null);

  function goTo(delta: number) {
    setActive((prev) => (prev + delta + allImages.length) % allImages.length);
  }

  function scrollThumbs(delta: number) {
    thumbListRef.current?.scrollBy({ top: delta, behavior: 'smooth' });
  }

  const thumbButtonClasses = (i: number) =>
    `relative aspect-square w-full shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
      active === i ? 'border-water-500' : 'border-grey-200 hover:border-grey-300'
    }`;

  return (
    <div className="lg:flex lg:items-start lg:gap-4">
      {hasMultiple && (
        <div className="hidden lg:flex lg:w-[84px] lg:shrink-0 lg:flex-col lg:items-center lg:gap-2">
          <button
            type="button"
            onClick={() => scrollThumbs(-200)}
            aria-label="Scroll thumbnails up"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-grey-300 text-grey-500 transition-colors hover:border-water-500 hover:text-water-600"
          >
            <ChevronUpIcon />
          </button>
          <div ref={thumbListRef} className="flex max-h-[420px] w-full flex-col gap-2.5 overflow-y-auto">
            {allImages.map((img, i) => (
              <button
                key={`${img.url}-${i}`}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`${name} image ${i + 1}`}
                aria-current={active === i ? 'true' : undefined}
                className={thumbButtonClasses(i)}
              >
                <Image src={img.url} alt={img.alt ?? name} fill sizes="84px" className="object-cover" />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => scrollThumbs(200)}
            aria-label="Scroll thumbnails down"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-grey-300 text-grey-500 transition-colors hover:border-water-500 hover:text-water-600"
          >
            <ChevronDownIcon />
          </button>
        </div>
      )}

      <div className="min-w-0 lg:flex-1">
        <div className="relative mx-auto aspect-square max-h-[500px] w-full overflow-hidden rounded-lg border border-grey-200 bg-white min-[1440px]:max-h-[560px]">
          <Image
            src={allImages[active]?.url ?? mainImage}
            alt={allImages[active]?.alt ?? name}
            fill
            sizes="(min-width: 1024px) 35vw, 100vw"
            className="object-contain"
            priority
          />
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={() => goTo(-1)}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-navy-950 shadow transition-colors hover:bg-white lg:hidden"
              >
                &lsaquo;
              </button>
              <button
                type="button"
                onClick={() => goTo(1)}
                aria-label="Next image"
                className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-navy-950 shadow transition-colors hover:bg-white lg:hidden"
              >
                &rsaquo;
              </button>
            </>
          )}
        </div>
        {hasMultiple && (
          <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1 lg:hidden" aria-label="Product thumbnails">
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
    </div>
  );
}
