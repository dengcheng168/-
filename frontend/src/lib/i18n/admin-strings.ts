export interface AdminNavItem {
  label: string;
  href: string;
  /** 待开发占位项：没有对应真实页面/数据时用这个代替假功能，不可点击，侧边栏显示"待开发"徽标 */
  disabled?: boolean;
}

export type AdminNavIcon = 'grid' | 'file-text' | 'layout' | 'inbox' | 'image' | 'settings' | 'shield';

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
    title: '内容中心',
    icon: 'file-text',
    items: [
      { label: '产品列表', href: '/admin/products' },
      { label: '产品分类', href: '/admin/product-categories' },
      { label: 'FAQ 管理', href: '/admin/faqs' },
      { label: '页面文案', href: '/admin/pages' },
    ],
  },
  {
    title: '博客管理',
    icon: 'file-text',
    items: [
      { label: '博客文章', href: '/admin/blog' },
      { label: '博客分类', href: '/admin/blog-categories' },
      { label: '博客标签', href: '/admin/blog-tags' },
    ],
  },
  {
    title: '网站装修',
    icon: 'layout',
    items: [
      { label: '首页模块', href: '/admin/homepage' },
      { label: '导航菜单', href: '/admin/navigation' },
      { label: '页脚设置', href: '/admin/footer' },
      { label: '证书管理', href: '/admin/certificates' },
      { label: '301 重定向', href: '/admin/redirects' },
    ],
  },
  {
    title: '客户中心',
    icon: 'inbox',
    items: [
      // 询盘来源/导出记录必须排在询盘管理前面：findActiveNav 按数组顺序取第一个前缀匹配，
      // '/admin/inquiries/sources' 也能匹配上 '/admin/inquiries' 这个更短的前缀，
      // 顺序反了会导致这两个子页面的侧边栏高亮和面包屑都错误地显示成"询盘管理"
      { label: '询盘来源', href: '/admin/inquiries/sources' },
      { label: '导出记录', href: '/admin/inquiries/exports' },
      { label: '询盘管理', href: '/admin/inquiries' },
      { label: '客户管理', href: '/admin/customers' },
    ],
  },
  {
    title: '媒体库',
    icon: 'image',
    items: [
      { label: '全部媒体', href: '/admin/media' },
      { label: '图片上传', href: '/admin/media/upload' },
      { label: '未使用媒体', href: '/admin/media/unused' },
    ],
  },
  {
    title: '全站设置',
    icon: 'settings',
    items: [
      { label: '网站基础设置', href: '/admin/settings/contact' },
      { label: 'SEO 与追踪', href: '/admin/settings/seo' },
      { label: '像素设置', href: '/admin/settings/pixels' },
      { label: '社交媒体', href: '/admin/settings/social' },
      { label: 'WhatsApp', href: '/admin/settings/whatsapp' },
      { label: 'SMTP 邮件', href: '/admin/settings/smtp' },
      { label: '缓存管理', href: '/admin/settings/cache' },
      { label: '多语言设置', href: '/admin/settings/i18n' },
    ],
  },
  {
    title: '账户与权限',
    icon: 'shield',
    items: [
      { label: '管理员设置', href: '/admin/settings/account' },
      { label: '管理员管理', href: '/admin/settings/admin-users' },
      { label: '登录记录', href: '/admin/settings/login-logs' },
      { label: '操作日志', href: '/admin/settings/audit-logs' },
    ],
  },
];

/** 根据当前路由查找所属分组与菜单项，供面包屑与侧边栏高亮使用 */
export function findActiveNav(pathname: string): { group: AdminNavGroup; item: AdminNavItem } | null {
  for (const group of ADMIN_NAV) {
    for (const item of group.items) {
      if (item.disabled) continue;
      // 前缀匹配必须带上尾部斜杠再比较，否则 /admin/blog-tags 会被 href 为 /admin/blog 的
      // "博客文章"提前匹配走（字符串前缀重合但不是真的子路径）
      const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`));
      if (active) return { group, item };
    }
  }
  return null;
}
