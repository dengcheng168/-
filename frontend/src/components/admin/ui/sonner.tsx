'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';

/**
 * 验证过 sonner 内部不使用 ReactDOM.createPortal（不像 Radix 组件会 portal 到 body），
 * 它只是一个 position:fixed 的普通 DOM 节点，因此直接挂载在 .admin-theme 子树内
 * 就能通过正常的 CSS 变量级联继承后台主题色，不需要额外接入 AdminPortalProvider。
 */
function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--success-bg': 'var(--popover)',
          '--success-text': '#16a34a',
          '--error-bg': 'var(--popover)',
          '--error-text': 'var(--destructive)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { Toaster };
