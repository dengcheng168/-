import { adminFetch } from '@/lib/api/admin-client';
import { getCurrentAdmin } from '@/lib/auth/session';
import { PageHeader } from '@/components/admin/PageHeader';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { AdminTable, AdminTableHead, AdminEmptyRow } from '@/components/admin/AdminTable';
import { Badge } from '@/components/admin/ui/badge';
import { fieldInputClasses } from '@/components/admin/FormField';

interface AuditLogRow {
  id: number;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string;
  result: string;
  ipAddress: string | null;
  createdAt: string;
}

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await getCurrentAdmin();
  if (user?.role !== 'SUPER_ADMIN') {
    return <AdminForbidden message="操作日志只有超级管理员可以查看。" />;
  }

  const params = await searchParams;
  const query = new URLSearchParams({ pageSize: '100' });
  if (params.adminEmail) query.set('adminEmail', params.adminEmail);
  if (params.action) query.set('action', params.action);
  if (params.entityType) query.set('entityType', params.entityType);
  if (params.result) query.set('result', params.result);
  if (params.from) query.set('from', params.from);
  if (params.to) query.set('to', params.to);

  const { data } = await adminFetch<AuditLogRow[]>(`/audit-logs?${query.toString()}`);

  return (
    <div>
      <PageHeader title="操作日志" description="后台关键操作记录，只读，不提供修改或删除。" />

      <form className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-3" method="get">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">操作人邮箱</label>
          <input name="adminEmail" defaultValue={params.adminEmail ?? ''} className={fieldInputClasses} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">动作</label>
          <input name="action" defaultValue={params.action ?? ''} placeholder="例如 product.update" className={fieldInputClasses} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">资源类型</label>
          <input name="entityType" defaultValue={params.entityType ?? ''} placeholder="例如 product" className={fieldInputClasses} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">结果</label>
          <select name="result" defaultValue={params.result ?? ''} className={fieldInputClasses}>
            <option value="">全部</option>
            <option value="SUCCESS">成功</option>
            <option value="FAILURE">失败</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">从</label>
          <input type="datetime-local" name="from" defaultValue={params.from ?? ''} className={fieldInputClasses} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">到</label>
          <input type="datetime-local" name="to" defaultValue={params.to ?? ''} className={fieldInputClasses} />
        </div>
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          筛选
        </button>
      </form>

      <AdminTable>
        <AdminTableHead columns={['时间', '操作人', '动作', '对象', '结果']} />
        <tbody>
          {data.length === 0 && <AdminEmptyRow colSpan={5} />}
          {data.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-none">
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{new Date(row.createdAt).toLocaleString('zh-CN')}</td>
              <td className="px-4 py-3 text-foreground">{row.adminEmail}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.action}</td>
              <td className="px-4 py-3 text-foreground">{row.summary}</td>
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
