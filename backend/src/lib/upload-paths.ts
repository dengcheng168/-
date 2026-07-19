import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import { env } from '../config/env.js';

export const UPLOAD_ROOT = path.resolve(env.UPLOAD_DIR);
export const ORIGINALS_DIR = path.join(UPLOAD_ROOT, 'originals');
export const WEBP_DIR = path.join(UPLOAD_ROOT, 'webp');
export const THUMBNAILS_DIR = path.join(UPLOAD_ROOT, 'thumbnails');

export async function ensureUploadDirs() {
  await Promise.all([ORIGINALS_DIR, WEBP_DIR, THUMBNAILS_DIR].map((dir) => fs.mkdir(dir, { recursive: true })));
}

/**
 * 生成随机、安全的磁盘文件名，避免使用用户上传的原始文件名（防路径穿越 / 覆盖 / 特殊字符问题）。
 */
export function generateSafeFilename(extension: string): string {
  const random = crypto.randomBytes(16).toString('hex');
  return `${Date.now()}-${random}${extension}`;
}

export function toPublicUrl(kind: 'originals' | 'webp' | 'thumbnails', filename: string): string {
  return `/uploads/${kind}/${filename}`;
}
