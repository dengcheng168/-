import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/session';
import { ADMIN_LOGIN_PATH } from '@/config/constants';
import { AdminShell } from '@/components/admin/AdminShell';

export const metadata: Metadata = {
  title: { default: '仪表盘', template: '%s | 后台管理' },
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentAdmin();
  if (!user) {
    redirect(ADMIN_LOGIN_PATH);
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
