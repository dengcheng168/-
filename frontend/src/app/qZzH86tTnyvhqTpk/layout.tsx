import type { Metadata } from 'next';
import '../globals.css';
import { getAdminBaseMetadata } from '@/lib/seo/base-metadata';

// 独立的根 layout（app/ 顶层已经没有共享的 layout.tsx）。这个隐藏登录页之前没有自己的
// layout.tsx，完全依赖共享根 layout 提供 <html>/<body>/globals.css——现在必须自己补上，
// 否则这条路由会没有任何根 layout。除了新增的 <html>/<body> 外，行为跟之前完全一样：
// 路径本身（app/proxy.ts 里的隐藏入口策略）没有改动，page.tsx 自己的 title/robots 也没有改动。
export async function generateMetadata(): Promise<Metadata> {
  return getAdminBaseMetadata();
}

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
