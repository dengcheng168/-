import Link from 'next/link';
import { adminFetch } from '@/lib/api/admin-client';
import { AdminTable, AdminTableHead, AdminEmptyRow } from '@/components/admin/AdminTable';
import { StatusBadge } from '@/components/admin/StatusBadge';

interface Row {
  id: number;
  name: string;
  company: string | null;
  email: string;
  status: string;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'NEW', label: '待处理' },
  { value: 'CONTACTED', label: '已联系' },
  { value: 'QUOTED', label: '已报价' },
  { value: 'CLOSED', label: '已关闭' },
  { value: 'SPAM', label: '垃圾询盘' },
];

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const qs = status ? `&status=${status}` : '';
  const { data } = await adminFetch<Row[]>(`/inquiries?pageSize=100${qs}`);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-navy-950">询盘管理</h1>
        <a
          href={`/api/admin/inquiries/export${status ? `?status=${status}` : ''}`}
          className="rounded-md border border-grey-200 bg-white px-4 py-2 text-sm font-medium text-navy-950 hover:bg-grey-50"
        >
          导出 CSV
        </a>
      </div>

      <div className="mt-4 flex gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={opt.value ? `/admin/inquiries?status=${opt.value}` : '/admin/inquiries'}
            className={`rounded-full px-3 py-1.5 text-sm ${
              (status ?? '') === opt.value ? 'bg-navy-900 text-white' : 'bg-grey-100 text-grey-700 hover:bg-grey-200'
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <AdminTable>
          <AdminTableHead columns={['姓名', '公司', '邮箱', '状态', '提交时间', '操作']} />
          <tbody>
            {data.length === 0 && <AdminEmptyRow colSpan={6} />}
            {data.map((row) => (
              <tr key={row.id} className="border-b border-grey-100 last:border-none">
                <td className="px-4 py-3 font-medium text-navy-950">{row.name}</td>
                <td className="px-4 py-3 text-grey-500">{row.company ?? '-'}</td>
                <td className="px-4 py-3 text-grey-500">{row.email}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3 text-grey-500">{new Date(row.createdAt).toLocaleString('zh-CN')}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/inquiries/${row.id}`} className="text-water-600 hover:underline">
                    查看
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
