export type GalleryGroup = 'manufacturing' | 'quality' | 'visits';

/**
 * 展示区块和页面顺序。每张图自身保存 galleryGroup，因此后台新增图片后会直接显示在
 * 对应区块；同一区块内按照后台的 sortOrder 排列。
 */
export const GALLERY_GROUP_SEQUENCE: GalleryGroup[] = ['manufacturing', 'quality', 'visits'];

export const GALLERY_GROUP_LABEL: Record<GalleryGroup, string> = {
  manufacturing: '生产流程',
  quality: '质量检测',
  visits: '客户到访',
};

// Rolling-deploy compatibility: the public site may briefly return legacy rows
// before the database migration adds galleryGroup.
export function legacyGalleryGroup(itemId: number): GalleryGroup {
  if ([3, 7, 9, 10].includes(itemId)) return 'quality';
  if ([13, 14, 15, 16].includes(itemId)) return 'visits';
  return 'manufacturing';
}
