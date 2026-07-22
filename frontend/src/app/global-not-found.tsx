import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

// app/ 顶层已经没有共享的 layout.tsx 了（(site)/es/admin/登录页各自是独立的根 layout，
// 见 lib/seo/base-metadata.ts 的说明），所以真正"任何路由段都没匹配上"的情况（比如访问一个
// 完全不存在的顶层路径）现在必须靠这个 Next.js 官方的 global-not-found 约定来兜底——它是
// 唯一游离在所有根 layout 之外的特殊文件，必须自己是一份完整的 HTML 文档，自己 import
// globals.css，不能复用任何一个根 layout 的 <html>。需要在 next.config.ts 里开
// experimental.globalNotFound 才会生效。
//
// 这跟站内各个根 layout 各自的 not-found.tsx（(site)/not-found.tsx、es/not-found.tsx）是
//两件事：那两个处理的是"路由段匹配上了，但调用了 notFound()"（比如产品 slug 不存在），
// 渲染在对应语言的根 layout 里，正常带 Header/Footer；这个文件只处理"整个应用都没有任何
// 路由能匹配这个 URL"的兜底情况，没有 Header/Footer，因为都还没进入任何一棵路由树。
export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col items-center justify-center px-4 py-12 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-water-600">404</p>
        <h1 className="mt-2 text-3xl font-semibold text-navy-950">Page Not Found</h1>
        <p className="mt-3 max-w-md text-grey-500">
          Sorry, we couldn&rsquo;t find the page you were looking for. It may have been moved or no longer exists.
        </p>
        <div className="mt-8">
          <Link href="/" className="rounded-md bg-water-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-water-600">
            Back to Home
          </Link>
        </div>
      </body>
    </html>
  );
}
