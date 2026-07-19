'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminThemeProvider, useAdminTheme } from './AdminThemeProvider';
import { AdminPortalProvider } from './AdminPortalProvider';
import { Toaster } from './ui/sonner';
import { cn } from '@/lib/utils';
import type { AdminUser } from '@/lib/auth/session';

function AdminShellInner({ user, children }: { user: AdminUser; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme } = useAdminTheme();

  return (
    <div
      suppressHydrationWarning
      className={cn('admin-theme flex min-h-screen bg-background', theme === 'dark' && 'dark')}
    >
      {/*
        AdminPortalProvider 必须包在 .admin-theme 内部——它渲染的 #admin-portal-root
        是 Dialog/DropdownMenu/Tooltip 等弹层的真正挂载点，只有在这个 div 里才能
        读到 --primary/--background 等主题变量（见 globals.css 里 .admin-theme 的说明）。
      */}
      <AdminPortalProvider>
        <AdminSidebar
          user={user}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader user={user} onOpenMobileMenu={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
        <Toaster position="top-right" theme={theme} />
      </AdminPortalProvider>
    </div>
  );
}

export function AdminShell({ user, children }: { user: AdminUser; children: ReactNode }) {
  return (
    <AdminThemeProvider>
      <AdminShellInner user={user}>{children}</AdminShellInner>
    </AdminThemeProvider>
  );
}
