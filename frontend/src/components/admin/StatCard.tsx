import Link from 'next/link';

export function StatCard({ label, value, href }: { label: string; value: number | string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-[#E5E7EB] bg-white p-5 transition-shadow hover:shadow-sm"
    >
      <div className="text-2xl font-semibold text-[#111827]">{value}</div>
      <div className="mt-1 text-sm text-[#6B7280]">{label}</div>
    </Link>
  );
}
