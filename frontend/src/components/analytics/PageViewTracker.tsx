'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * 挂在 (site)/es 两个前台根 layout 里（不含后台面板和隐藏登录页，那两个是独立的根 layout，
 * 本来就没引这个组件），每次路由变化都记一次访问——放在客户端而不是服务端中间件里，是因为
 * App Router 下同一个根 layout 在客户端路由跳转时不会重新执行服务端渲染，只有这里能感知到
 * 每一次页面切换。用 usePathname() 放进 effect 依赖数组，保证客户端跳转也会重新触发，不是
 * 只在整页刷新时打一次点。
 *
 * fire-and-forget：调用失败不重试、不提示、不影响页面本身，只是"数据概览"页少一条统计。
 */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api';
    fetch(`${base}/page-views`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
