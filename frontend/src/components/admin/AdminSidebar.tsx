'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_NAV } from '@/lib/i18n/admin-strings';

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-grey-200 bg-white lg:block">
      <div className="flex h-16 items-center border-b border-grey-200 px-5">
        <Link href="/admin" className="text-base font-semibold text-navy-950">
          净水器工厂后台
        </Link>
      </div>
      <nav className="space-y-6 overflow-y-auto px-3 py-5">
        {ADMIN_NAV.map((group) => (
          <div key={group.title}>
            <div className="px-2 text-xs font-semibold uppercase tracking-wide text-grey-500">{group.title}</div>
            <div className="mt-2 space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-md px-3 py-2 text-sm font-medium ${
                      active ? 'bg-navy-900 text-white' : 'text-grey-700 hover:bg-grey-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
