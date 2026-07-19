import sharp from 'sharp';
import { THUMBNAIL_SIZE } from '../../config/constants.js';

export interface ProcessedImage {
  width: number | null;
  height: number | null;
  webpBuffer: Buffer | null;
  thumbnailBuffer: Buffer | null;
}

/**
 * 为光栅图片生成 WebP 版本和缩略图。SVG/PDF 不做处理，原样存储。
 * 使用 sharp（libvips），在 2GB 内存的服务器上同步处理单张图片开销很小，无需队列。
 */
export async function processRasterImage(buffer: Buffer): Promise<ProcessedImage> {
  const image = sharp(buffer, { limitInputPixels: 268402689 }); // 约 16384x16384，防止超大图片耗尽内存
  const metadata = await image.metadata();

  const webpBuffer = await sharp(buffer).webp({ quality: 82 }).toBuffer();
  const thumbnailBuffer = await sharp(buffer)
    .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 75 })
    .toBuffer();

  return {
    width: metadata.width ?? null,
    height: metadata.height ?? null,
    webpBuffer,
    thumbnailBuffer,
  };
}
