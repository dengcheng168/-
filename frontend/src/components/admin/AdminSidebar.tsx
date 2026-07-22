'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_NAV, findActiveNav, type AdminNavIcon } from '@/lib/i18n/admin-strings';
import { logoutAction } from '@/lib/actions/auth';
import type { AdminUser } from '@/lib/auth/session';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import {
  IconGrid,
  IconFileText,
  IconLayout,
  IconInbox,
  IconImage,
  IconSettings,
  IconShieldCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconX,
} from './icons';

const GROUP_ICONS: Record<AdminNavIcon, (props: { className?: string }) => React.JSX.Element> = {
  grid: IconGrid,
  'file-text': IconFileText,
  layout: IconLayout,
  inbox: IconInbox,
  image: IconImage,
  settings: IconSettings,
  shield: IconShieldCheck,
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
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <Link href="/admin" className="truncate text-sm font-semibold text-sidebar-foreground">
            鲤门科技独立站管理后台
          </Link>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
          className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent lg:flex"
        >
          {collapsed ? <IconChevronRight className="h-4 w-4" /> : <IconChevronLeft className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="关闭菜单"
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent lg:hidden"
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
            const firstHref = group.items.find((i) => !i.disabled)?.href ?? group.items[0].href;
            return (
              <Tooltip key={group.title}>
                <TooltipTrigger asChild>
                  <Link
                    href={firstHref}
                    className={cn(
                      'flex h-10 items-center justify-center rounded-md',
                      groupHasActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-muted-foreground hover:bg-sidebar-accent',
                    )}
                  >
                    <GroupIcon className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{group.title}</TooltipContent>
              </Tooltip>
            );
          }

          return (
            <div key={group.title}>
              <button
                type="button"
                onClick={() => toggleGroup(group.title)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase hover:bg-sidebar-accent"
              >
                <GroupIcon className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">{group.title}</span>
                <IconChevronDown className={cn('h-3.5 w-3.5 shrink-0 transition-transform', !isOpen && '-rotate-90')} />
              </button>

              {isOpen && (
                <div className="mt-0.5 space-y-0.5">
                  {group.items.map((item) => {
                    if (item.disabled) {
                      return (
                        <span
                          key={item.href}
                          className="flex cursor-not-allowed items-center justify-between rounded-md py-2 pl-8 pr-3 text-sm text-muted-foreground/60"
                        >
                          {item.label}
                          <Badge variant="muted" className="shrink-0 text-[10px]">
                            待开发
                          </Badge>
                        </span>
                      );
                    }

                    // 复用 findActiveNav 算出的唯一匹配项，不要在这里另外用 pathname.startsWith(item.href)
                    // 独立判断——之前这么写漏了尾部斜杠，'/admin/inquiries/sources' 也会把
                    // '/admin/inquiries'（询盘管理）一起判定成 active，导致两个菜单项同时高亮
                    const itemActive = active?.item.href === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'relative block rounded-md py-2 pl-8 pr-3 text-sm',
                          itemActive
                            ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent',
                        )}
                      >
                        {itemActive && (
                          <span className="absolute top-1/2 left-2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-sidebar-primary" />
                        )}
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

      <div className="shrink-0 border-t border-sidebar-border p-3">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
              {(user.name ?? user.email).slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-sidebar-foreground">{user.name ?? user.email}</div>
              <Link href="/admin/settings/account" className="text-xs text-muted-foreground hover:text-sidebar-foreground">
                系统设置
              </Link>
            </div>
            <form action={logoutAction}>
              <button type="submit" className="text-xs font-medium text-muted-foreground hover:text-sidebar-foreground">
                退出
              </button>
            </form>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
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
        className={cn(
          'hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-150 lg:flex',
          collapsed ? 'w-[72px]' : 'w-[232px]',
        )}
      >
        {content}
      </aside>

      {/* 移动端抽屉 */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={onCloseMobile} />
          <aside className="absolute inset-y-0 left-0 flex w-[260px] flex-col bg-sidebar shadow-xl">{content}</aside>
        </div>
      )}
    </>
  );
}
