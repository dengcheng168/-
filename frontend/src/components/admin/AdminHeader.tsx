'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { findActiveNav } from '@/lib/i18n/admin-strings';
import { logoutAction } from '@/lib/actions/auth';
import type { AdminUser } from '@/lib/auth/session';
import { Breadcrumb } from './Breadcrumb';
import { IconMenu, IconExternalLink, IconBell, IconUser, IconChevronDown } from './icons';

export function AdminHeader({ user, onOpenMobileMenu }: { user: AdminUser; onOpenMobileMenu: () => void }) {
  const pathname = usePathname();
  const active = findActiveNav(pathname);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="打开菜单"
          className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] hover:bg-[#F6F7F9] lg:hidden"
        >
          <IconMenu className="h-5 w-5" />
        </button>
        {active ? <Breadcrumb group={active.group.title} label={active.item.label} /> : <span />}
      </div>

      <div className="flex items-center gap-1.5">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-[#374151] hover:bg-[#F6F7F9] sm:flex"
        >
          <IconExternalLink className="h-4 w-4" />
          查看网站
        </a>

        <button
          type="button"
          aria-label="通知"
          className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] hover:bg-[#F6F7F9]"
        >
          <IconBell className="h-[18px] w-[18px]" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-md py-1.5 pl-1.5 pr-2 hover:bg-[#F6F7F9]"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EEF2FF] text-[#0a2540]">
              <IconUser className="h-4 w-4" />
            </div>
            <IconChevronDown className="h-3.5 w-3.5 text-[#6B7280]" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-[#E5E7EB] bg-white p-1 shadow-lg">
                <div className="px-3 py-2">
                  <div className="truncate text-sm font-medium text-[#111827]">{user.name ?? user.email}</div>
                  <div className="truncate text-xs text-[#6B7280]">
                    {user.email} · {user.role === 'SUPER_ADMIN' ? '超级管理员' : '编辑'}
                  </div>
                </div>
                <div className="my-1 h-px bg-[#E5E7EB]" />
                <Link
                  href="/admin/settings/account"
                  className="block rounded-md px-3 py-2 text-sm text-[#374151] hover:bg-[#F6F7F9]"
                  onClick={() => setMenuOpen(false)}
                >
                  账号设置
                </Link>
                <form action={logoutAction}>
                  <button type="submit" className="block w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                    退出登录
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
