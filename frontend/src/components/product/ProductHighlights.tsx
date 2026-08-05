import type { Product } from '@/types/product';

/**
 * CTA 下方的紧凑卖点列表：直接复用后台已经录入的 product.features（真实数据），
 * 只取前几条标题，不编造内容。没有 features 数据时不渲染，不用假内容占位。
 */
export function ProductHighlights({ features }: { features: Product['features'] }) {
  if (features.length === 0) return null;
  const items = features.slice(0, 4).map((f) => (typeof f === 'string' ? f : f.title));

  return (
    <ul className="mt-4 grid gap-2 rounded-r-lg border-l-[3px] border-water-500 bg-water-100/50 px-4 py-3 sm:grid-cols-2">
      {items.map((label) => (
        <li key={label} className="flex items-center gap-2.5 text-sm text-navy-900">
          <span
            aria-hidden="true"
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-white"
          >
            &#10003;
          </span>
          {label}
        </li>
      ))}
    </ul>
  );
}
