'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

const AdminPortalContext = createContext<HTMLDivElement | null>(null);

/**
 * Radix 的 Dialog/DropdownMenu 等组件默认把内容 Portal 到 document.body，
 * 而我们的 shadcn token 取值只在 .admin-theme 这个子树里生效（见 globals.css）。
 * 如果任由它们 portal 到 body（.admin-theme 之外），弹出内容就会读不到
 * --primary/--background 等变量，样式直接丢失。
 *
 * 这里提供一个挂在 .admin-theme 内部的容器节点，后台所有 Radix Portal 组件都
 * 通过 useAdminPortalContainer() 拿到它并传给 Portal 的 container prop，
 * 保证弹层始终渲染在有主题变量的子树里。
 */
export function AdminPortalProvider({ children }: { children: ReactNode }) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <AdminPortalContext.Provider value={container}>
      {children}
      <div id="admin-portal-root" ref={setContainer} />
    </AdminPortalContext.Provider>
  );
}

/** 返回 null 时（首次挂载前）Radix Portal 会退回默认的 document.body，属于短暂过渡态。 */
export function useAdminPortalContainer() {
  return useContext(AdminPortalContext);
}
