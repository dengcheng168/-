export interface AdminNavItem {
  label: string;
  href: string;
}

export interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV: AdminNavGroup[] = [
  { title: '概览', items: [{ label: '仪表盘', href: '/admin' }] },
  {
    title: '产品',
    items: [
      { label: '产品管理', href: '/admin/products' },
      { label: '产品分类', href: '/admin/product-categories' },
    ],
  },
  {
    title: '内容',
    items: [
      { label: '博客文章', href: '/admin/blog' },
      { label: '博客分类', href: '/admin/blog-categories' },
      { label: '博客标签', href: '/admin/blog-tags' },
      { label: '证书管理', href: '/admin/certificates' },
      { label: 'FAQ 管理', href: '/admin/faqs' },
      { label: '客户评价', href: '/admin/testimonials' },
      { label: '页面文案', href: '/admin/pages' },
      { label: '首页模块', href: '/admin/homepage' },
    ],
  },
  {
    title: '站点结构',
    items: [
      { label: '导航菜单', href: '/admin/navigation' },
      { label: '页脚设置', href: '/admin/footer' },
      { label: '媒体库', href: '/admin/media' },
      { label: '301 重定向', href: '/admin/redirects' },
    ],
  },
  { title: '询盘', items: [{ label: '询盘管理', href: '/admin/inquiries' }] },
  {
    title: '设置',
    items: [
      { label: 'SEO 设置', href: '/admin/settings/seo' },
      { label: '联系方式', href: '/admin/settings/contact' },
      { label: '社交媒体', href: '/admin/settings/social' },
      { label: 'WhatsApp', href: '/admin/settings/whatsapp' },
      { label: 'SMTP 邮件', href: '/admin/settings/smtp' },
      { label: '管理员账号', href: '/admin/settings/account' },
      { label: '系统信息', href: '/admin/settings/system' },
    ],
  },
];
