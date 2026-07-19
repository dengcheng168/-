import type { ProductSpec } from '@/types/product';

export function ProductSpecTable({ specs }: { specs: ProductSpec[] }) {
  if (specs.length === 0) return null;

  return (
    <table className="w-full border-collapse overflow-hidden rounded-lg border border-grey-200 text-sm">
      <tbody>
        {specs.map((spec) => (
          <tr key={spec.label} className="border-b border-grey-200 last:border-none even:bg-grey-50">
            <th className="w-1/3 px-4 py-2.5 text-left font-medium text-grey-700">{spec.label}</th>
            <td className="px-4 py-2.5 text-navy-950">{spec.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
