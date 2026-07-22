import Link from 'next/link';

/** href 可选：不是所有统计都有对应的后台列表页可以跳转（例如访问量目前只是一个数字，
 * 没有专门的明细页面），省略时渲染成不可点击的纯展示卡片，样式保持一致。 */
export function StatCard({ label, value, href }: { label: string; value: number | string; href?: string }) {
  const content = (
    <>
      <div className="text-2xl font-semibold text-[#111827]">{value}</div>
      <div className="mt-1 text-sm text-[#6B7280]">{label}</div>
    </>
  );

  if (!href) {
    return <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">{content}</div>;
  }

  return (
    <Link href={href} className="rounded-xl border border-[#E5E7EB] bg-white p-5 transition-shadow hover:shadow-sm">
      {content}
    </Link>
  );
}
