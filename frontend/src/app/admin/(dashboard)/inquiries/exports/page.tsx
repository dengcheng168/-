import { adminFetch } from '@/lib/api/admin-client';
import { AdminTable, AdminTableHead, AdminEmptyRow } from '@/components/admin/AdminTable';
import { PageHeader } from '@/components/admin/PageHeader';
import { Badge } from '@/components/admin/ui/badge';

interface ExportLogRow {
  id: number;
  adminEmail: string;
  summary: string;
  result: string;
  createdAt: string;
}

export default async function AdminInquiryExportsPage() {
  const { data } = await adminFetch<ExportLogRow[]>('/inquiries/exports?pageSize=100');

  return (
    <div>
      <PageHeader title="导出记录" description="谁在什么时候导出过询盘 CSV，只读，不提供修改或删除。" />

      <AdminTable>
        <AdminTableHead columns={['时间', '操作人', '说明', '结果']} />
        <tbody>
          {data.length === 0 && <AdminEmptyRow colSpan={4} />}
          {data.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-none">
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{new Date(row.createdAt).toLocaleString('zh-CN')}</td>
              <td className="px-4 py-3 text-foreground">{row.adminEmail}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.summary}</td>
              <td className="px-4 py-3">
                <Badge variant={row.result === 'SUCCESS' ? 'success' : 'destructive'}>{row.result === 'SUCCESS' ? '成功' : '失败'}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </div>
  );
}
