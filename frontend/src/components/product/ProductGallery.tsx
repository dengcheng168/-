'use client';

import { useEffect, useRef, useState } from 'react';
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
  // 主图展示框按当前图片的真实宽高比自适应，避免正方形固定框在遇到非正方形图片时产生留白
  const [ratio, setRatio] = useState(1);
  // 鼠标在图片框内的位置（百分比），null 表示未悬停，仅桌面端（lg+）生效
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null);
  const hasMultiple = allImages.length > 1;
  const thumbListRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mainImgRef = useRef<HTMLImageElement>(null);

  function goTo(delta: number) {
    setActive((prev) => (prev + delta + allImages.length) % allImages.length);
  }

  function applyNaturalRatio(el: HTMLImageElement) {
    if (el.naturalWidth && el.naturalHeight) setRatio(el.naturalWidth / el.naturalHeight);
  }

  // next/image 的 onLoad 只在浏览器实际发起并完成加载时触发；如果该 URL 已被浏览器缓存
  // （例如切换缩略图后再切回来），img 会直接以 complete=true 挂载，onLoad 不会再派发一次，
  // 这里在每次切换图片后做一次同步检查作为兜底，避免展示框停留在上一张图的宽高比上
  useEffect(() => {
    const el = mainImgRef.current;
    if (el?.complete) applyNaturalRatio(el);
  }, [active]);

  function handleZoomMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPos({
      x: Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100)),
    });
  }

  useEffect(() => {
    thumbRefs.current[active]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [active]);

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
            onClick={() => goTo(-1)}
            aria-label="Previous image"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-grey-300 text-grey-500 transition-colors hover:border-water-500 hover:text-water-600"
          >
            <ChevronUpIcon />
          </button>
          <div ref={thumbListRef} className="flex max-h-[420px] w-full flex-col gap-2.5 overflow-y-auto">
            {allImages.map((img, i) => (
              <button
                key={`${img.url}-${i}`}
                type="button"
                ref={(el) => {
                  thumbRefs.current[i] = el;
                }}
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
            onClick={() => goTo(1)}
            aria-label="Next image"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-grey-300 text-grey-500 transition-colors hover:border-water-500 hover:text-water-600"
          >
            <ChevronDownIcon />
          </button>
        </div>
      )}

      <div className="min-w-0 lg:flex-1">
        {/*
          外层 flex+justify-center 让 aspect-ratio 框以"高度固定、宽度按比例反推"的方式
          自适应尺寸。框本身没有任何占位内容（图片和放大镜浮层都是 absolute 定位，不参与
          正常布局撑开父元素），所以高度必须是明确值（h-*），不能只给 max-h-*——否则父元素
          既没有宽度也没有内容撑开高度，aspect-ratio 无从换算，框会直接塌成 0。
        */}
        <div className="flex justify-center">
          <div
            className="relative h-[500px] max-w-full min-[1440px]:h-[560px]"
            style={{ aspectRatio: ratio }}
            onMouseMove={handleZoomMove}
            onMouseLeave={() => setZoomPos(null)}
          >
            <div className="absolute inset-0 overflow-hidden rounded-lg border border-grey-200 bg-white lg:cursor-zoom-in">
              <Image
                ref={mainImgRef}
                src={allImages[active]?.url ?? mainImage}
                alt={allImages[active]?.alt ?? name}
                fill
                sizes="(min-width: 1024px) 35vw, 100vw"
                className="object-contain"
                priority
                onLoad={(e) => applyNaturalRatio(e.currentTarget)}
              />
              {zoomPos && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute hidden border-2 border-water-500 bg-water-500/10 lg:block"
                  style={{
                    width: '50%',
                    height: '50%',
                    left: `calc(${zoomPos.x}% - 25%)`,
                    top: `calc(${zoomPos.y}% - 25%)`,
                  }}
                />
              )}
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

            {zoomPos && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-full top-0 z-30 ml-4 hidden h-full w-[280px] overflow-hidden rounded-lg border border-grey-200 bg-white shadow-xl lg:block"
                style={{
                  backgroundImage: `url(${allImages[active]?.url ?? mainImage})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '200% 200%',
                  backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                }}
              />
            )}
          </div>
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
