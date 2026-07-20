import Link from 'next/link';
import { adminFetch } from '@/lib/api/admin-client';
import { getCurrentAdmin } from '@/lib/auth/session';
import { PageHeader } from '@/components/admin/PageHeader';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { AdminTable, AdminTableHead, AdminEmptyRow } from '@/components/admin/AdminTable';
import { Badge } from '@/components/admin/ui/badge';
import { Button } from '@/components/admin/ui/button';
import { adminRoleLabel } from '@/lib/auth/roles';
import { IconPlus } from '@/components/admin/icons';

interface AdminUserRow {
  id: number;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  recentFailureCount: number;
  locked: boolean;
}

export default async function AdminUsersPage() {
  const user = await getCurrentAdmin();
  if (user?.role !== 'SUPER_ADMIN') {
    return <AdminForbidden message="管理员管理只有超级管理员可以访问。" />;
  }

  const { data } = await adminFetch<AdminUserRow[]>('/admin-users');

  return (
    <div>
      <PageHeader
        title="管理员管理"
        description="查看和管理后台管理员账号、角色、锁定状态。"
        action={
          <Button asChild>
            <Link href="/admin/settings/admin-users/new">
              <IconPlus className="h-4 w-4" />
              新增管理员
            </Link>
          </Button>
        }
      />
      <AdminTable>
        <AdminTableHead columns={['邮箱', '姓名', '角色', '状态', '最近登录', '锁定状态', '操作']} />
        <tbody>
          {data.length === 0 && <AdminEmptyRow colSpan={7} />}
          {data.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-none">
              <td className="px-4 py-3 font-medium text-foreground">{row.email}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.name ?? '-'}</td>
              <td className="px-4 py-3 text-muted-foreground">{adminRoleLabel(row.role)}</td>
              <td className="px-4 py-3">
                <Badge variant={row.isActive ? 'success' : 'muted'}>{row.isActive ? '启用' : '已停用'}</Badge>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleString('zh-CN') : '从未登录'}
              </td>
              <td className="px-4 py-3">
                {row.locked ? (
                  <Badge variant="destructive">已锁定（{row.recentFailureCount} 次失败）</Badge>
                ) : row.recentFailureCount > 0 ? (
                  <Badge variant="warning">{row.recentFailureCount} 次失败</Badge>
                ) : (
                  <span className="text-muted-foreground">正常</span>
                )}
              </td>
              <td className="px-4 py-3">
                <Link href={`/admin/settings/admin-users/${row.id}`} className="text-primary hover:underline">
                  管理
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </div>
  );
}
