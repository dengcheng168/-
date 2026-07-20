import fs from 'node:fs/promises';
import path from 'node:path';
import type { PrismaClient } from '@prisma/client';
import { ALLOWED_UPLOAD_MIME_TYPES, RASTER_IMAGE_MIME_TYPES } from '../../config/constants.js';
import { toSkipTake, buildPaginationMeta, type PaginationQuery } from '../../lib/pagination.js';
import {
  UPLOAD_ROOT,
  ORIGINALS_DIR,
  WEBP_DIR,
  THUMBNAILS_DIR,
  ensureUploadDirs,
  generateSafeFilename,
  toPublicUrl,
} from '../../lib/upload-paths.js';
import { processRasterImage } from './image-processing.js';

export class UnsupportedFileTypeError extends Error {}
export class MediaInUseError extends Error {}

export interface SaveUploadInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  uploadedById?: number;
  altText?: string;
}

export async function saveUpload(prisma: PrismaClient, input: SaveUploadInput) {
  const extension = ALLOWED_UPLOAD_MIME_TYPES[input.mimeType];
  if (!extension) {
    throw new UnsupportedFileTypeError(`不支持的文件类型：${input.mimeType}`);
  }

  await ensureUploadDirs();

  const filename = generateSafeFilename(extension);
  await fs.writeFile(path.join(ORIGINALS_DIR, filename), input.buffer);

  let webpUrl: string | null = null;
  let thumbnailUrl: string | null = null;
  let width: number | null = null;
  let height: number | null = null;

  if (RASTER_IMAGE_MIME_TYPES.has(input.mimeType)) {
    const processed = await processRasterImage(input.buffer);
    width = processed.width;
    height = processed.height;

    if (processed.webpBuffer) {
      const webpFilename = filename.replace(extension, '.webp');
      await fs.writeFile(path.join(WEBP_DIR, webpFilename), processed.webpBuffer);
      webpUrl = toPublicUrl('webp', webpFilename);
    }

    if (processed.thumbnailBuffer) {
      const thumbFilename = filename.replace(extension, '.webp');
      await fs.writeFile(path.join(THUMBNAILS_DIR, thumbFilename), processed.thumbnailBuffer);
      thumbnailUrl = toPublicUrl('thumbnails', thumbFilename);
    }
  }

  return prisma.media.create({
    data: {
      filename,
      originalName: input.originalName,
      url: toPublicUrl('originals', filename),
      webpUrl,
      thumbnailUrl,
      mimeType: input.mimeType,
      size: input.buffer.byteLength,
      width,
      height,
      altText: input.altText,
      uploadedById: input.uploadedById,
    },
  });
}

export async function listAdminMedia(
  prisma: PrismaClient,
  query: PaginationQuery,
  filters: { mimeType?: string },
) {
  const where = filters.mimeType ? { mimeType: filters.mimeType } : {};
  const [items, total] = await Promise.all([
    prisma.media.findMany({ where, orderBy: { createdAt: 'desc' }, ...toSkipTake(query) }),
    prisma.media.count({ where }),
  ]);
  return { items, meta: buildPaginationMeta(query, total) };
}

export function getMediaById(prisma: PrismaClient, id: number) {
  return prisma.media.findUnique({ where: { id } });
}

export function updateMediaAltText(prisma: PrismaClient, id: number, altText: string) {
  return prisma.media.update({ where: { id }, data: { altText } });
}

/**
 * 删除前检查该媒体文件是否仍被产品/文章/证书/首页设置等引用。
 * 采用字符串匹配而非正式的关联表——在当前内容规模下足够简单可靠。
 */
export async function findMediaUsage(prisma: PrismaClient, url: string) {
  const usages: { type: string; id: number; name: string }[] = [];

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { mainImage: url },
        { ogImage: url },
        { specSheetUrl: url },
        { galleryImages: { contains: url } },
        // 富文本正文里手动插入的图片（不是通过主图/相册字段选的）也算在用，
        // 否则"未使用媒体"会误判成可以安全删除，实际删了会导致正文里出现失效图片
        { description: { contains: url } },
      ],
    },
    select: { id: true, name: true },
  });
  usages.push(...products.map((p) => ({ type: 'product', id: p.id, name: p.name })));

  const categories = await prisma.productCategory.findMany({
    where: { image: url },
    select: { id: true, name: true },
  });
  usages.push(...categories.map((c) => ({ type: 'product-category', id: c.id, name: c.name })));

  const posts = await prisma.blogPost.findMany({
    where: { OR: [{ coverImage: url }, { body: { contains: url } }] },
    select: { id: true, title: true },
  });
  usages.push(...posts.map((p) => ({ type: 'blog-post', id: p.id, name: p.title })));

  const certs = await prisma.certificate.findMany({
    where: { OR: [{ imageUrl: url }, { pdfUrl: url }] },
    select: { id: true, name: true },
  });
  usages.push(...certs.map((c) => ({ type: 'certificate', id: c.id, name: c.name })));

  const pages = await prisma.page.findMany({
    where: {
      OR: [{ ogImage: url }, { bodyHtml: { contains: url } }, { sections: { contains: url } }],
    },
    select: { id: true, title: true },
  });
  usages.push(...pages.map((p) => ({ type: 'page', id: p.id, name: p.title })));

  const settings = await prisma.siteSetting.findFirst({
    where: {
      OR: [
        { heroDesktopImage: url },
        { heroMobileImage: url },
        { companyLogoUrl: url },
        { defaultOgImage: url },
        { factoryPhotos: { contains: url } },
      ],
    },
  });
  if (settings) usages.push({ type: 'site-setting', id: settings.id, name: '首页/全局设置' });

  return usages;
}

/**
 * 逐个媒体文件复用 findMediaUsage 判断是否被引用——当前媒体库规模（几十到几百个文件）下，
 * N 次简单查询远比维护一张形式化的关联表划算，也保证跟"删除前检查"用的是同一套判断逻辑，
 * 不会出现"未使用媒体页面说没人用，点删除却报错被占用"这种自相矛盾的情况。
 */
export async function listUnusedMedia(prisma: PrismaClient) {
  const allMedia = await prisma.media.findMany({ orderBy: { createdAt: 'desc' } });
  const unused = [];
  for (const media of allMedia) {
    const usages = await findMediaUsage(prisma, media.url);
    if (usages.length === 0) unused.push(media);
  }
  return unused;
}

export async function deleteMedia(prisma: PrismaClient, id: number) {
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return;

  const usages = await findMediaUsage(prisma, media.url);
  if (usages.length > 0) {
    throw new MediaInUseError('该媒体文件仍被以下内容使用，无法删除');
  }

  await prisma.media.delete({ where: { id } });

  const filesToRemove = [
    path.join(ORIGINALS_DIR, media.filename),
    media.webpUrl ? path.join(UPLOAD_ROOT, media.webpUrl.replace('/uploads/', '')) : null,
    media.thumbnailUrl ? path.join(UPLOAD_ROOT, media.thumbnailUrl.replace('/uploads/', '')) : null,
  ].filter((p): p is string => !!p);

  await Promise.all(filesToRemove.map((filePath) => fs.unlink(filePath).catch(() => undefined)));
}
