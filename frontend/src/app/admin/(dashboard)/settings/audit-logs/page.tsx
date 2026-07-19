import { adminFetch } from '@/lib/api/admin-client';
import { getCurrentAdmin } from '@/lib/auth/session';
import { PageHeader } from '@/components/admin/PageHeader';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { AdminTable, AdminTableHead, AdminEmptyRow } from '@/components/admin/AdminTable';

interface AuditLogRow {
  id: number;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string;
  ipAddress: string | null;
  createdAt: string;
}

export default async function AdminAuditLogsPage() {
  const user = await getCurrentAdmin();
  if (user?.role !== 'SUPER_ADMIN') {
    return <AdminForbidden message="操作日志只有超级管理员可以查看。" />;
  }

  const { data } = await adminFetch<AuditLogRow[]>('/audit-logs?pageSize=100');

  return (
    <div>
      <PageHeader
        title="操作日志"
        description="后台关键操作记录（目前覆盖产品模块，后续批次会逐步扩展到其他内容模块）。"
      />
      <AdminTable>
        <AdminTableHead columns={['时间', '操作人', '操作', '对象']} />
        <tbody>
          {data.length === 0 && <AdminEmptyRow colSpan={4} />}
          {data.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-none">
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{new Date(row.createdAt).toLocaleString('zh-CN')}</td>
              <td className="px-4 py-3 text-foreground">{row.adminEmail}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.action}</td>
              <td className="px-4 py-3 text-foreground">{row.summary}</td>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </div>
  );
}
