export const API_PREFIX = '/api';
export const ADMIN_API_PREFIX = '/api/admin';

export const COOKIE_NAME = 'wp_session';
// 与默认 JWT_EXPIRES_IN=7d 对应；如修改该环境变量，请同步调整这里
export const COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// 允许上传的文件类型：JPG/PNG/WebP/AVIF/SVG/PDF（需求文档第十七节）
export const ALLOWED_UPLOAD_MIME_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/svg+xml': '.svg',
  'application/pdf': '.pdf',
};

export const RASTER_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export const THUMBNAIL_SIZE = 400;
