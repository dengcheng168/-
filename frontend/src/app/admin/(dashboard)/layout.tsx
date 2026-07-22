import type { Metadata } from 'next';
import '../../globals.css';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/session';
import { ADMIN_LOGIN_PATH } from '@/config/constants';
import { AdminShell } from '@/components/admin/AdminShell';
import { getAdminBaseMetadata } from '@/lib/seo/base-metadata';

// 独立的根 layout（app/ 顶层已经没有共享的 layout.tsx），后台一直都是英文 <html lang="en">，
// 这里只是把这个值从"继承自共享根 layout"变成"自己显式声明"，行为和之前完全一样。
// title/robots 沿用这个文件原来就有的设置，不受 getAdminBaseMetadata 影响（后者只提供
// metadataBase/icons，两者的字段互不重叠，合并后不会有冲突）。
export async function generateMetadata(): Promise<Metadata> {
  const base = await getAdminBaseMetadata();
  return {
    ...base,
    title: { default: '仪表盘', template: '%s | 后台管理' },
    robots: { index: false, follow: false },
  };
}

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentAdmin();
  if (!user) {
    redirect(ADMIN_LOGIN_PATH);
  }

  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <AdminShell user={user}>{children}</AdminShell>
      </body>
    </html>
  );
}
