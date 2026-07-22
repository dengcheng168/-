import Link from 'next/link';
import { adminFetch } from '@/lib/api/admin-client';
import { AdminTable, AdminTableHead, AdminEmptyRow } from '@/components/admin/AdminTable';
import { PageHeader } from '@/components/admin/PageHeader';

interface SourceStatRow {
  sourcePage: string;
  count: number;
  percentage: number;
}

const UNKNOWN_SOURCE = '(未知来源)';

export default async function AdminInquirySourcesPage() {
  const { data } = await adminFetch<SourceStatRow[]>('/inquiries/sources');

  return (
    <div>
      <PageHeader title="询盘来源" description="按提交页面统计的询盘分布（不含垃圾询盘），帮助判断哪些页面更容易带来询盘。" />

      <AdminTable>
        <AdminTableHead columns={['来源页面', '数量', '占比', '操作']} />
        <tbody>
          {data.length === 0 && <AdminEmptyRow colSpan={4} />}
          {data.map((row) => (
            <tr key={row.sourcePage} className="border-b border-border last:border-none">
              <td className="px-4 py-3 font-medium text-foreground">{row.sourcePage}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.count}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${row.percentage}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{row.percentage}%</span>
                </div>
              </td>
              <td className="px-4 py-3">
                {row.sourcePage === UNKNOWN_SOURCE ? (
                  <span className="text-muted-foreground">-</span>
                ) : (
                  <Link href={`/admin/inquiries?sourcePage=${encodeURIComponent(row.sourcePage)}`} className="text-primary hover:underline">
                    查看询盘
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </div>
  );
}
