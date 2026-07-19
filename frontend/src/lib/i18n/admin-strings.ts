export interface AdminNavItem {
  label: string;
  href: string;
}

export type AdminNavIcon = 'grid' | 'package' | 'file-text' | 'layout' | 'inbox' | 'settings';

export interface AdminNavGroup {
  title: string;
  icon: AdminNavIcon;
  items: AdminNavItem[];
}

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    title: '工作台',
    icon: 'grid',
    items: [{ label: '数据概览', href: '/admin' }],
  },
  {
    title: '产品管理',
    icon: 'package',
    items: [
      { label: '产品列表', href: '/admin/products' },
      { label: '产品分类', href: '/admin/product-categories' },
    ],
  },
  {
    title: '内容管理',
    icon: 'file-text',
    items: [
      { label: '博客文章', href: '/admin/blog' },
      { label: '博客分类', href: '/admin/blog-categories' },
      { label: '博客标签', href: '/admin/blog-tags' },
      { label: 'FAQ 管理', href: '/admin/faqs' },
      { label: '页面文案', href: '/admin/pages' },
    ],
  },
  {
    title: '网站管理',
    icon: 'layout',
    items: [
      { label: '首页模块', href: '/admin/homepage' },
      { label: '导航菜单', href: '/admin/navigation' },
      { label: '页脚设置', href: '/admin/footer' },
      { label: '证书管理', href: '/admin/certificates' },
      { label: '媒体库', href: '/admin/media' },
      { label: '301 重定向', href: '/admin/redirects' },
    ],
  },
  {
    title: '客户与询盘',
    icon: 'inbox',
    items: [{ label: '询盘管理', href: '/admin/inquiries' }],
  },
  {
    title: '系统设置',
    icon: 'settings',
    items: [
      { label: '网站基础设置', href: '/admin/settings/contact' },
      { label: 'SEO 设置', href: '/admin/settings/seo' },
      { label: '社交媒体', href: '/admin/settings/social' },
      { label: 'WhatsApp', href: '/admin/settings/whatsapp' },
      { label: 'SMTP 邮件', href: '/admin/settings/smtp' },
      { label: '管理员设置', href: '/admin/settings/account' },
    ],
  },
];

/** 根据当前路由查找所属分组与菜单项，供面包屑与侧边栏高亮使用 */
export function findActiveNav(pathname: string): { group: AdminNavGroup; item: AdminNavItem } | null {
  for (const group of ADMIN_NAV) {
    for (const item of group.items) {
      const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
      if (active) return { group, item };
    }
  }
  return null;
}
