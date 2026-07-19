/**
 * 后端返回的媒体路径（/uploads/...）在生产环境下与前端同源（Nginx 反代），可直接使用相对路径；
 * 本地开发时前端(3000)与后端(4000)是不同源，需要拼接后端地址才能正确加载图片/文件。
 */
export function resolveMediaUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/uploads/')) {
    const base = process.env.NEXT_PUBLIC_UPLOADS_BASE_URL ?? '';
    return `${base}${path}`;
  }
  return path;
}
