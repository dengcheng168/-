'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { findActiveNav } from '@/lib/i18n/admin-strings';
import { logoutAction } from '@/lib/actions/auth';
import type { AdminUser } from '@/lib/auth/session';
import { adminRoleLabel } from '@/lib/auth/roles';
import { Breadcrumb } from './Breadcrumb';
import { ThemeToggle } from './ThemeToggle';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { IconMenu, IconExternalLink, IconUser, IconChevronDown } from './icons';

export function AdminHeader({ user, onOpenMobileMenu }: { user: AdminUser; onOpenMobileMenu: () => void }) {
  const pathname = usePathname();
  const active = findActiveNav(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="打开菜单"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted lg:hidden"
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
          className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted sm:flex"
        >
          <IconExternalLink className="h-4 w-4" />
          查看网站
        </a>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md py-1.5 pl-1.5 pr-2 hover:bg-muted">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <IconUser className="h-4 w-4" />
            </div>
            <IconChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="truncate text-sm font-medium text-foreground">{user.name ?? user.email}</div>
              <div className="truncate text-xs text-muted-foreground">
                {user.email} · {adminRoleLabel(user.role)}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/settings/account">账号设置</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={logoutAction}>
              <DropdownMenuItem asChild variant="destructive">
                <button type="submit" className="w-full text-left">
                  退出登录
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
