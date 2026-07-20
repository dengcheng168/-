import Link from 'next/link';
import { adminFetch } from '@/lib/api/admin-client';
import { AdminTable, AdminTableHead } from '@/components/admin/AdminTable';
import { PageHeader } from '@/components/admin/PageHeader';

interface Row {
  slug: string;
  title: string;
}

const PAGE_LABELS: Record<string, string> = {
  about: '关于我们',
  factory: '工厂实力',
  'oem-odm': 'OEM/ODM 服务',
  'privacy-policy': '隐私政策',
  'terms-of-use': '使用条款',
  contact: '联系我们',
  certificates: '证书页',
  blog: '博客列表',
  products: '产品列表',
};

export default async function AdminPagesPage() {
  const { data } = await adminFetch<Row[]>('/pages');

  return (
    <div>
      <PageHeader title="页面文案" description="编辑各静态页面的标题、正文与 SEO 信息。" />

      <div>
        <AdminTable>
          <AdminTableHead columns={['页面', 'Slug', '操作']} />
          <tbody>
            {data.map((row) => (
              <tr key={row.slug} className="border-b border-grey-100 last:border-none">
                <td className="px-4 py-3 font-medium text-navy-950">{PAGE_LABELS[row.slug] ?? row.title}</td>
                <td className="px-4 py-3 text-grey-500">{row.slug}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/pages/${row.slug}`} className="text-water-600 hover:underline">
                    编辑
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      </div>
    </div>
  );
}
