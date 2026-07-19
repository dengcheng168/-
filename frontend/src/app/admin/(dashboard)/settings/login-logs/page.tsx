import { adminFetch } from '@/lib/api/admin-client';
import { getCurrentAdmin } from '@/lib/auth/session';
import { PageHeader } from '@/components/admin/PageHeader';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { AdminTable, AdminTableHead, AdminEmptyRow } from '@/components/admin/AdminTable';
import { Badge } from '@/components/admin/ui/badge';

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
  LOCKED: '触发临时锁定',
  INACTIVE: '账号已被禁用',
};

export default async function AdminLoginLogsPage() {
  const user = await getCurrentAdmin();
  if (user?.role !== 'SUPER_ADMIN') {
    return <AdminForbidden message="登录记录只有超级管理员可以查看，里面包含其他管理员账号的登录 IP 等信息。" />;
  }

  const { data } = await adminFetch<LoginLogRow[]>('/login-logs?pageSize=100');

  return (
    <div>
      <PageHeader title="登录记录" description="所有后台登录尝试（成功和失败），用于排查异常登录。" />
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
