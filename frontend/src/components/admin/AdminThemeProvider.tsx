'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'admin-theme';

const AdminThemeContext = createContext<{ theme: Theme; toggleTheme: () => void } | null>(null);

function readInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * 不使用 next-themes——它的 attribute="class" 默认写在 document.documentElement 上。
 * App Router 是 SPA，从 /admin 客户端跳转到前台页面时这个 class 不会自动清除，
 * 会导致深色模式"泄漏"到前台（原生表单控件配色、滚动条等）。
 * 这里改为自定义 Provider，dark class 只加在 AdminShell 自己的根节点（.admin-theme）上，
 * 完全不碰 <html>/<body>，从根上避免影响前台，且使用独立的 localStorage key。
 *
 * 初始值用 useState 的惰性初始化函数直接读 localStorage，不放进 useEffect 里再 setState
 * ——那样会触发 react-hooks 的"effect 内同步 setState 引发级联渲染"规则。服务端渲染时
 * window 不存在，惰性初始化会退回 'light'，客户端首次渲染可能立即读到 'dark'，
 * 两者之间如有一次性的 className 水合差异，已经在 AdminShell 根节点标了
 * suppressHydrationWarning（这也是 Next.js 官方文档对这种"主题只有客户端才知道"场景的推荐做法）。
 */
export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  function toggleTheme() {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }

  return <AdminThemeContext.Provider value={{ theme, toggleTheme }}>{children}</AdminThemeContext.Provider>;
}

export function useAdminTheme() {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) throw new Error('useAdminTheme 必须在 AdminThemeProvider 内使用');
  return ctx;
}
