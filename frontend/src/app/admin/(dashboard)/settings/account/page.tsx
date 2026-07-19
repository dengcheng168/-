import { adminFetch } from '@/lib/api/admin-client';
import { PageHeader } from '@/components/admin/PageHeader';
import { adminRoleLabel } from '@/lib/auth/roles';
import { ChangePasswordForm } from './ChangePasswordForm';

interface Account {
  email: string;
  name: string | null;
  role: string;
  lastLoginAt: string | null;
}

export default async function AdminAccountSettingsPage() {
  const { data } = await adminFetch<Account>('/account/me');

  return (
    <div>
      <PageHeader title="管理员设置" description="查看当前登录账号信息，并修改登录密码。" />

      <div className="max-w-xl rounded-lg border border-border bg-card p-5 text-sm">
        <p>
          <span className="text-muted-foreground">邮箱：</span>
          {data.email}
        </p>
        <p className="mt-1">
          <span className="text-muted-foreground">角色：</span>
          {adminRoleLabel(data.role)}
        </p>
        <p className="mt-1">
          <span className="text-muted-foreground">上次登录：</span>
          {data.lastLoginAt ? new Date(data.lastLoginAt).toLocaleString('zh-CN') : '-'}
        </p>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-foreground">修改密码</h2>
      <div className="mt-4">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
