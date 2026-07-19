import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/session';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export const metadata: Metadata = {
  title: { default: '仪表盘', template: '%s | 后台管理' },
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentAdmin();
  if (!user) {
    redirect('/admin/login');
  }

  return (
    <div className="flex min-h-screen bg-grey-50">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader user={user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
