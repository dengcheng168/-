import { translate } from '@/lib/api/translations';
import type { NavigationItem } from '@/types/navigation';
import type { PublicSiteSettings } from '@/types/settings';

/**
 * 把 Translation 表里的西班牙语覆盖叠加到英文原始内容上——没有对应译文的字段自动回退显示英文，
 * 不会出现空白或占位符。key 命名和后台"多语言设置"编辑页（admin/settings/i18n）使用的完全一致。
 *
 * FAQ 曾经也用这套机制（旧的 localizeFaqs），现在已经统一切到 FaqTranslation 为正式事实源
 * （见 lib/i18n/faq-source.ts 的 resolveFaqListContent），旧 Translation 表的 faq.* key
 * 只作为迁移兼容回退，不再从这个文件读取——faq.* 数据本身继续保留在数据库里，没有删除。
 */
export function localizeNavigation(items: NavigationItem[], map: Record<string, string>): NavigationItem[] {
  return items.map((item) => ({ ...item, label: translate(map, `nav.${item.id}.label`, item.label) }));
}

export function localizeHero(settings: PublicSiteSettings, map: Record<string, string>): PublicSiteSettings {
  return {
    ...settings,
    heroHeadline: translate(map, 'settings.heroHeadline', settings.heroHeadline),
    heroSubheadline: translate(map, 'settings.heroSubheadline', settings.heroSubheadline),
    heroButton1Text: translate(map, 'settings.heroButton1Text', settings.heroButton1Text),
    heroButton2Text: translate(map, 'settings.heroButton2Text', settings.heroButton2Text),
  };
}
