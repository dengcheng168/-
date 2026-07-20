import { getCurrentAdmin } from '@/lib/auth/session';
import { PageHeader } from '@/components/admin/PageHeader';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { createAdminUserAction } from '@/lib/actions/admin/admin-users';
import { AdminUserForm } from '../AdminUserForm';

export default async function NewAdminUserPage() {
  const user = await getCurrentAdmin();
  if (user?.role !== 'SUPER_ADMIN') {
    return <AdminForbidden message="管理员管理只有超级管理员可以访问。" />;
  }

  return (
    <div>
      <PageHeader title="新增管理员" description="创建一个新的后台管理员账号。" />
      <AdminUserForm action={createAdminUserAction} mode="create" />
    </div>
  );
}
