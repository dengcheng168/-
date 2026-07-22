import { notFound } from 'next/navigation';

/**
 * 兜底路由：/admin/* 下任何没有匹配到具体 page.tsx 的地址都会落到这里。
 * 必须显式调用 notFound()，请求才会在"已经进入 (dashboard) 布局"的状态下
 * 触发同目录的 not-found.tsx（带侧边栏/顶栏的后台 404），而不是掉到根级/前台的 404。
 */
export default function AdminCatchAll() {
  notFound();
}
