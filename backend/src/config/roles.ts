/** 三档角色：见需求文档「三、后台登录和权限」。存成字符串（SQLite 无原生 enum），取值在这里集中定义。 */
export const ADMIN_ROLES = ['SUPER_ADMIN', 'CONTENT_ADMIN', 'SALES'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: '超级管理员',
  CONTENT_ADMIN: '内容管理员',
  SALES: '销售人员',
};

/** 能管理网站内容（产品/分类/博客/证书/FAQ/页面/首页/导航/页脚/媒体）的角色 */
export const CONTENT_ROLES: AdminRole[] = ['SUPER_ADMIN', 'CONTENT_ADMIN'];

/** 能管理询盘的角色 */
export const INQUIRY_ROLES: AdminRole[] = ['SUPER_ADMIN', 'SALES'];
