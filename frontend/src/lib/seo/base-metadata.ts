import type { Metadata } from 'next';
import { getPublicSettings } from '@/lib/api/settings';
import { getSiteUrl } from './site';
import type { Locale } from '@/lib/i18n/locales';

/**
 * Next.js「多个根 layout」约定：一旦 app/ 顶层没有共享的 layout.tsx，每个独立的根 layout
 * （(site)/es/admin/登录页）各自负责声明自己的 <html>，metadata 也不会跨根继承——
 * 每一份都要自己有 metadataBase / icons，不能指望从别的根 layout 拿到。
 * 这里抽成共享函数只是避免 4 处分别手写同一段 fetch 逻辑，不是运行时的"继承"。
 */
async function sharedMetadataBase(): Promise<Pick<Metadata, 'metadataBase' | 'icons'>> {
  const settings = await getPublicSettings();
  return {
    metadataBase: new URL(getSiteUrl()),
    // 必须显式传 icons，不能依赖 app/favicon.ico 的文件约定兜底：Next.js 文档明确说文件约定
    // 的图标优先级高于 metadata 里配置的 icons，两者会同时输出成两个 <link rel="icon">，
    // 浏览器实测会优先选中文件约定那个，导致后台传了新图标也不生效。
    icons: { icon: settings.faviconUrl || '/favicon.ico' },
  };
}

/** 前台公开站点（(site) 和 es 两棵根 layout 共用）：品牌默认标题/描述/OG，按 locale 只有 openGraph 部分不同 */
export async function getPublicBaseMetadata(locale: Locale): Promise<Metadata> {
  const [base, settings] = await Promise.all([sharedMetadataBase(), getPublicSettings()]);
  return {
    ...base,
    title: {
      default: 'OEM & ODM Water Purifier Manufacturer',
      template: '%s | Water Purifier Factory',
    },
    description: 'Reliable water purification solutions for global brands, distributors and commercial projects.',
    openGraph: {
      locale,
      alternateLocale: locale === 'en' ? 'es' : 'en',
      siteName: settings.companyName || 'Water Purifier Factory',
    },
  };
}

/**
 * 后台仪表盘和登录页根 layout 共用：只需要 metadataBase/icons（跟公开站点共用同一个favicon，
 * 保持之前"后台和前台图标一致"的行为不变），不需要公开站点的品牌标题/OG——这两个根各自的
 * layout/page 已经自己定义了完整的 title（"仪表盘 | 后台管理"、"管理员登录"），不依赖这里。
 */
export async function getAdminBaseMetadata(): Promise<Metadata> {
  return sharedMetadataBase();
}
