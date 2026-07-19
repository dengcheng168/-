import Link from 'next/link';
import { adminFetch } from '@/lib/api/admin-client';

async function countOf(path: string): Promise<number> {
  try {
    const separator = path.includes('?') ? '&' : '?';
    const { meta } = await adminFetch<unknown[]>(`${path}${separator}page=1&pageSize=1`);
    return meta?.total ?? 0;
  } catch {
    return 0;
  }
}

export default async function AdminDashboardPage() {
  const [products, posts, inquiries, newInquiries, categories] = await Promise.all([
    countOf('/products'),
    countOf('/blog'),
    countOf('/inquiries'),
    countOf('/inquiries?status=NEW'),
    countOf('/product-categories'),
  ]);

  const cards = [
    { label: '产品总数', value: products, href: '/admin/products' },
    { label: '博客文章', value: posts, href: '/admin/blog' },
    { label: '产品分类', value: categories, href: '/admin/product-categories' },
    { label: '询盘总数', value: inquiries, href: '/admin/inquiries' },
    { label: '待处理询盘', value: newInquiries, href: '/admin/inquiries?status=NEW' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">仪表盘</h1>
      <p className="mt-1 text-sm text-grey-500">欢迎回来，这里是网站内容概览。</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-lg border border-grey-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <div className="text-2xl font-bold text-navy-950">{card.value}</div>
            <div className="mt-1 text-sm text-grey-500">{card.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
