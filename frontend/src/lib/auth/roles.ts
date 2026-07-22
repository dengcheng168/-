/** 与后端 backend/src/config/roles.ts 保持一致，仅用于展示文案 */
export const ADMIN_ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: '超级管理员',
  CONTENT_ADMIN: '内容管理员',
  SALES: '销售人员',
};

export function adminRoleLabel(role: string): string {
  return ADMIN_ROLE_LABELS[role] ?? role;
}
