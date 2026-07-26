import { translate } from '@/lib/api/translations';

export interface ResolveHomeSeoMetadataInput {
  translations: Record<string, string>;
  defaultSeoTitle: string | null | undefined;
  defaultSeoDescription: string | null | undefined;
}

export interface ResolvedHomeSeoMetadata {
  title: string | undefined;
  description: string | undefined;
}

/**
 * 首页 SEO title/description 取值优先级：Translation(locale, 'seo.home.title'/'seo.home.description')
 * > SiteSetting.defaultSeoTitle/defaultSeoDescription > 不设置（回退根 layout 的默认 title/description）。
 * 英语首页永远不传 translations（空表），等价于只走后两级，行为与改动前完全一致。
 */
export function resolveHomeSeoMetadata({
  translations,
  defaultSeoTitle,
  defaultSeoDescription,
}: ResolveHomeSeoMetadataInput): ResolvedHomeSeoMetadata {
  const title = translate(translations, 'seo.home.title', defaultSeoTitle ?? '');
  const description = translate(translations, 'seo.home.description', defaultSeoDescription ?? '');
  return {
    title: title.trim() !== '' ? title : undefined,
    description: description.trim() !== '' ? description : undefined,
  };
}
