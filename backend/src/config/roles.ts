import { rolesWithPermission } from './permissions.js';

/** 三档角色：见需求文档「三、后台登录和权限」。存成字符串（SQLite 无原生 enum），取值在这里集中定义。 */
export const ADMIN_ROLES = ['SUPER_ADMIN', 'CONTENT_ADMIN', 'SALES'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: '超级管理员',
  CONTENT_ADMIN: '内容管理员',
  SALES: '销售人员',
};

// 下面这些分组常量都是从 permissions.ts 的权限矩阵派生的，不是独立维护的第二份角色列表——
// 矩阵才是唯一事实源，改权限只需要改 permissions.ts。
export const CONTENT_ROLES = rolesWithPermission('products', 'write');
export const INQUIRY_ROLES = rolesWithPermission('inquiries', 'write');
export const ADMIN_MANAGE_ROLES = rolesWithPermission('admins', 'write');
export const SETTINGS_SENSITIVE_ROLES = rolesWithPermission('settingsSensitive', 'write');
export const LOG_VIEW_ROLES = rolesWithPermission('logs', 'read');
