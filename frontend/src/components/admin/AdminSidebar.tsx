'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_NAV, findActiveNav, type AdminNavIcon } from '@/lib/i18n/admin-strings';
import { logoutAction } from '@/lib/actions/auth';
import type { AdminUser } from '@/lib/auth/session';
import {
  IconGrid,
  IconPackage,
  IconFileText,
  IconLayout,
  IconInbox,
  IconSettings,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconX,
} from './icons';

const GROUP_ICONS: Record<AdminNavIcon, (props: { className?: string }) => React.JSX.Element> = {
  grid: IconGrid,
  package: IconPackage,
  'file-text': IconFileText,
  layout: IconLayout,
  inbox: IconInbox,
  settings: IconSettings,
};

interface AdminSidebarProps {
  user: AdminUser;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function AdminSidebar({ user, collapsed, onToggleCollapse, mobileOpen, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const active = findActiveNav(pathname);
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set(active ? [active.group.title] : []));

  // 路由切换时，确保当前所在分组自动展开（渲染期间同步 state，避免在 effect 里直接 setState）
  const [syncedPathname, setSyncedPathname] = useState(pathname);
  if (pathname !== syncedPathname) {
    setSyncedPathname(pathname);
    if (active && !openGroups.has(active.group.title)) {
      setOpenGroups(new Set(openGroups).add(active.group.title));
    }
  }

  // 路由切换时关闭移动端抽屉——这是响应外部导航事件的副作用，保留在 effect 中
  useEffect(() => {
    onCloseMobile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function toggleGroup(title: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  }

  const content = (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#E5E7EB] px-4">
        {!collapsed && (
          <Link href="/admin" className="truncate text-sm font-semibold text-[#111827]">
            净水器工厂后台
          </Link>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
          className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#6B7280] hover:bg-[#F6F7F9] lg:flex"
        >
          {collapsed ? <IconChevronRight className="h-4 w-4" /> : <IconChevronLeft className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="关闭菜单"
          className="flex h-7 w-7 items-center justify-center rounded-md text-[#6B7280] hover:bg-[#F6F7F9] lg:hidden"
        >
          <IconX className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {ADMIN_NAV.map((group) => {
          const GroupIcon = GROUP_ICONS[group.icon];
          const isOpen = collapsed ? false : openGroups.has(group.title);
          const groupHasActive = active?.group.title === group.title;

          if (collapsed) {
            const firstHref = group.items[0].href;
            return (
              <Link
                key={group.title}
                href={firstHref}
                title={group.title}
                className={`flex h-10 items-center justify-center rounded-md ${
                  groupHasActive ? 'bg-[#EEF2FF] text-[#0a2540]' : 'text-[#6B7280] hover:bg-[#F6F7F9]'
                }`}
              >
                <GroupIcon className="h-5 w-5" />
              </Link>
            );
          }

          return (
            <div key={group.title}>
              <button
                type="button"
                onClick={() => toggleGroup(group.title)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280] hover:bg-[#F6F7F9]"
              >
                <GroupIcon className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">{group.title}</span>
                <IconChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
              </button>

              {isOpen && (
                <div className="mt-0.5 space-y-0.5">
                  {group.items.map((item) => {
                    const itemActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`relative block rounded-md py-2 pl-8 pr-3 text-sm ${
                          itemActive ? 'bg-[#EEF2FF] font-medium text-[#0a2540]' : 'text-[#374151] hover:bg-[#F6F7F9]'
                        }`}
                      >
                        {itemActive && <span className="absolute left-2 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-[#0a2540]" />}
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-[#E5E7EB] p-3">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-xs font-semibold text-[#0a2540]">
              {(user.name ?? user.email).slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-[#111827]">{user.name ?? user.email}</div>
              <Link href="/admin/settings/account" className="text-xs text-[#6B7280] hover:text-[#0a2540]">
                系统设置
              </Link>
            </div>
            <form action={logoutAction}>
              <button type="submit" className="text-xs font-medium text-[#6B7280] hover:text-[#0a2540]">
                退出
              </button>
            </form>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF2FF] text-xs font-semibold text-[#0a2540]">
              {(user.name ?? user.email).slice(0, 1).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* 桌面端固定侧边栏 */}
      <aside
        className={`hidden shrink-0 flex-col border-r border-[#E5E7EB] bg-white transition-[width] duration-150 lg:flex ${
          collapsed ? 'w-[72px]' : 'w-[232px]'
        }`}
      >
        {content}
      </aside>

      {/* 移动端抽屉 */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={onCloseMobile} />
          <aside className="absolute inset-y-0 left-0 flex w-[260px] flex-col bg-white shadow-xl">{content}</aside>
        </div>
      )}
    </>
  );
}
