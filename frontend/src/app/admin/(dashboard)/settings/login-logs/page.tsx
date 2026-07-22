import { adminFetch } from '@/lib/api/admin-client';
import { getCurrentAdmin } from '@/lib/auth/session';
import { PageHeader } from '@/components/admin/PageHeader';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { AdminTable, AdminTableHead, AdminEmptyRow } from '@/components/admin/AdminTable';
import { Badge } from '@/components/admin/ui/badge';
import { fieldInputClasses } from '@/components/admin/FormField';

interface LoginLogRow {
  id: number;
  email: string;
  success: boolean;
  reason: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

const REASON_LABELS: Record<string, string> = {
  INVALID_CREDENTIALS: '密码或邮箱错误',
  INACTIVE: '账号已被禁用',
  LOCKED_EMAIL_IP: '该邮箱+IP 组合触发锁定',
  LOCKED_IP_WIDE: '该 IP 触发锁定',
  LOCKED_EMAIL_WIDE: '该邮箱跨 IP 触发锁定',
};

export default async function AdminLoginLogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await getCurrentAdmin();
  if (user?.role !== 'SUPER_ADMIN') {
    return <AdminForbidden message="登录记录只有超级管理员可以查看，里面包含其他管理员账号的登录 IP 等信息。" />;
  }

  const params = await searchParams;
  const query = new URLSearchParams({ pageSize: '100' });
  if (params.email) query.set('email', params.email);
  if (params.success) query.set('success', params.success);

  const { data } = await adminFetch<LoginLogRow[]>(`/login-logs?${query.toString()}`);

  return (
    <div>
      <PageHeader title="登录记录" description="所有后台登录尝试（成功和失败），用于排查异常登录。" />

      <form className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-3" method="get">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">邮箱</label>
          <input name="email" defaultValue={params.email ?? ''} className={fieldInputClasses} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">结果</label>
          <select name="success" defaultValue={params.success ?? ''} className={fieldInputClasses}>
            <option value="">全部</option>
            <option value="true">成功</option>
            <option value="false">失败</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          筛选
        </button>
      </form>

      <AdminTable>
        <AdminTableHead columns={['时间', '邮箱', '结果', '失败原因', 'IP 地址', '设备']} />
        <tbody>
          {data.length === 0 && <AdminEmptyRow colSpan={6} />}
          {data.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-none">
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{new Date(row.createdAt).toLocaleString('zh-CN')}</td>
              <td className="px-4 py-3 text-foreground">{row.email}</td>
              <td className="px-4 py-3">
                <Badge variant={row.success ? 'success' : 'destructive'}>{row.success ? '成功' : '失败'}</Badge>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{row.reason ? (REASON_LABELS[row.reason] ?? row.reason) : '-'}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.ipAddress ?? '-'}</td>
              <td className="max-w-xs truncate px-4 py-3 text-muted-foreground" title={row.userAgent ?? ''}>
                {row.userAgent ?? '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </div>
  );
}
