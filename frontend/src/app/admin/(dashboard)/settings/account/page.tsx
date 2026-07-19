import { adminFetch } from '@/lib/api/admin-client';
import { PageHeader } from '@/components/admin/PageHeader';
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

      <div className="max-w-xl rounded-lg border border-grey-200 bg-white p-5 text-sm">
        <p>
          <span className="text-grey-500">邮箱：</span>
          {data.email}
        </p>
        <p className="mt-1">
          <span className="text-grey-500">角色：</span>
          {data.role === 'SUPER_ADMIN' ? '超级管理员' : '编辑'}
        </p>
        <p className="mt-1">
          <span className="text-grey-500">上次登录：</span>
          {data.lastLoginAt ? new Date(data.lastLoginAt).toLocaleString('zh-CN') : '-'}
        </p>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-navy-950">修改密码</h2>
      <div className="mt-4">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
