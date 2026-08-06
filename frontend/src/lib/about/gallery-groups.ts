export type GalleryGroup = 'manufacturing' | 'quality' | 'packaging' | 'visits';

/**
 * About 页面 16 组工厂展示图（FactoryGalleryItem）按公司故事重新分组的顺序映射。
 * key 是生产库里真实的 factory_gallery_items.id，按分组内展示顺序排列——不改数据库
 * sortOrder（后台列表仍按原顺序管理），只在前台展示层重新编排。
 * 映射依据：图片原标题逐一核对生产数据库内容，见 2026-08-07 B2B 可信度增强第二批报告。
 */
export const GALLERY_GROUP_ORDER: Record<GalleryGroup, number[]> = {
  manufacturing: [12, 8, 11, 5, 6, 1],
  quality: [9, 10, 7, 3],
  packaging: [2, 4],
  visits: [13, 15, 14, 16],
};

export const GALLERY_GROUP_SEQUENCE: GalleryGroup[] = ['manufacturing', 'quality', 'packaging', 'visits'];
