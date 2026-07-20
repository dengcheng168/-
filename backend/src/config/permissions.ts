import type { AdminRole } from './roles.js';

/**
 * 统一权限矩阵：谁能对哪类资源做读/写，是唯一事实源。
 * roles.ts 里给路由用的 CONTENT_ROLES/INQUIRY_ROLES 等分组常量都是从这里派生出来的，
 * 不要在别的地方另外写死角色数组——新增一个资源类型时只需要改这一个文件。
 */
export type Resource =
  | 'admins' // 管理员账号管理
  | 'products'
  | 'productCategories'
  | 'blog'
  | 'blogCategories'
  | 'blogTags'
  | 'certificates'
  | 'faqs'
  | 'media'
  | 'pages'
  | 'navigation'
  | 'redirects'
  | 'homepage'
  | 'footer'
  | 'translations' // 多语言译文（目前仅西班牙语）
  | 'settings' // 一般站点设置：联系方式/SEO/社交/WhatsApp
  | 'settingsSensitive' // SMTP 凭据、Turnstile 密钥
  | 'inquiries'
  | 'logs'; // 登录记录 + 操作日志

export type Action = 'read' | 'write';

type Matrix = Record<AdminRole, Partial<Record<Resource, Action[]>>>;

const CONTENT_RESOURCES: Resource[] = [
  'products',
  'productCategories',
  'blog',
  'blogCategories',
  'blogTags',
  'certificates',
  'faqs',
  'media',
  'pages',
  'navigation',
  'redirects',
  'homepage',
  'footer',
  'translations',
];

const RW = ['read', 'write'] as const;

export const PERMISSION_MATRIX: Matrix = {
  SUPER_ADMIN: {
    admins: [...RW],
    settings: [...RW],
    settingsSensitive: [...RW],
    logs: ['read'],
    inquiries: [...RW],
    ...Object.fromEntries(CONTENT_RESOURCES.map((r) => [r, [...RW]])),
  },
  CONTENT_ADMIN: {
    settings: [...RW],
    ...Object.fromEntries(CONTENT_RESOURCES.map((r) => [r, [...RW]])),
    // 明确不给：admins / settingsSensitive / logs / inquiries
  },
  SALES: {
    inquiries: [...RW],
    // 明确不给：admins / settings / settingsSensitive / logs / 任何内容资源
  },
};

export function can(role: string, resource: Resource, action: Action): boolean {
  const entry = (PERMISSION_MATRIX as Record<string, Partial<Record<Resource, Action[]>>>)[role];
  return entry?.[resource]?.includes(action) ?? false;
}

/** 返回矩阵里对某个资源+操作有权限的所有角色，供 roles.ts 派生分组常量使用 */
export function rolesWithPermission(resource: Resource, action: Action): AdminRole[] {
  return (Object.keys(PERMISSION_MATRIX) as AdminRole[]).filter((role) => can(role, resource, action));
}
