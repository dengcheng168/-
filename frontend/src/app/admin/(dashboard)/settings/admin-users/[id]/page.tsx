import { notFound } from 'next/navigation';
import { adminFetch } from '@/lib/api/admin-client';
import { getCurrentAdmin } from '@/lib/auth/session';
import { PageHeader } from '@/components/admin/PageHeader';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { updateAdminUserAction } from '@/lib/actions/admin/admin-users';
import { AdminUserForm } from '../AdminUserForm';
import { AdminUserActions } from './AdminUserActions';
import { ResetPasswordForm } from './ResetPasswordForm';

interface AdminUserDetail {
  id: number;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  recentFailureCount: number;
  locked: boolean;
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentAdmin();
  if (currentUser?.role !== 'SUPER_ADMIN') {
    return <AdminForbidden message="管理员管理只有超级管理员可以访问。" />;
  }

  const { id } = await params;
  const result = await adminFetch<AdminUserDetail>(`/admin-users/${id}`).catch(() => null);
  if (!result) notFound();
  const user = result.data;

  const boundAction = updateAdminUserAction.bind(null, user.id);
  const isSelf = currentUser.id === user.id;

  return (
    <div className="space-y-10">
      <div>
        <PageHeader title={`管理员：${user.email}`} description="修改姓名、邮箱、角色或启用状态。" />
        <AdminUserForm action={boundAction} mode="edit" initialValues={user} disableSelfDeactivate={isSelf} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">登录安全</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          最近登录：{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('zh-CN') : '从未登录'} · 近期失败次数：
          {user.recentFailureCount} · {user.locked ? '当前已锁定' : '当前未锁定'}
        </p>
        <AdminUserActions id={user.id} locked={user.locked} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">重置密码</h2>
        <ResetPasswordForm id={user.id} />
      </div>
    </div>
  );
}
