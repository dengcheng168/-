import { logoutAction } from '@/lib/actions/auth';
import type { AdminUser } from '@/lib/auth/session';

export function AdminHeader({ user }: { user: AdminUser }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-grey-200 bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-grey-700">
          {user.name ?? user.email} <span className="text-grey-500">({user.role === 'SUPER_ADMIN' ? '超级管理员' : '编辑'})</span>
        </span>
        <form action={logoutAction}>
          <button type="submit" className="text-sm font-medium text-grey-500 hover:text-navy-950">
            退出登录
          </button>
        </form>
      </div>
    </header>
  );
}
