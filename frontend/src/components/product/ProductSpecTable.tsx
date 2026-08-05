import type { ProductSpec } from '@/types/product';
import { cn } from '@/lib/utils';

export function ProductSpecTable({ specs }: { specs: ProductSpec[] }) {
  if (specs.length === 0) return null;

  return (
    <dl className="grid grid-cols-1 overflow-hidden rounded-lg border border-grey-200 sm:grid-cols-2">
      {specs.map((spec, i) => (
        <div
          key={spec.label}
          className={cn(
            'grid grid-cols-[minmax(150px,38%)_1fr] border-b border-grey-200 last:border-b-0',
            i % 2 === 0 ? 'sm:border-r' : '',
          )}
        >
          <dt className="break-words bg-grey-50 px-4 py-3 text-sm font-medium text-grey-700">{spec.label}</dt>
          <dd className="break-words px-4 py-3 text-sm text-navy-950">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}
