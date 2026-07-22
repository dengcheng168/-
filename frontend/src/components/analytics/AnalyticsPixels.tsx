import { getPublicSettings } from '@/lib/api/settings';
import type { Locale } from '@/lib/i18n/locales';
import { MetaPixel } from './MetaPixel';
import { GooglePixel } from './GooglePixel';
import { TikTokPixel } from './TikTokPixel';

/**
 * 只在后台"像素设置"里填了对应 ID 时才注入脚本；没填的平台完全不加载，不会有空脚本标签。
 * 目前只接了 Meta / Google / TikTok 三家（用户明确要求的范围），"推特（X）像素"字段还在，
 * 但没有对应组件——按需要接入时再补，现在填了也不会生效。
 *
 * locale 只是给已经会发送的 PageView 事件附带一个 page_language 自定义参数，不会导致
 * pixel 重复初始化（每个页面只渲染一次这个组件，跟英文站原来的行为完全一样，只是多传了
 * 一个参数）。TikTok 的 ttq.page() 调用没有改——它的自定义参数 API 没有把握确认清楚，
 * 与其猜一个可能出错的写法，不如先不动，留到以后专门对接 TikTok 事件时再做。
 */
export async function AnalyticsPixels({ locale = 'en' }: { locale?: Locale } = {}) {
  const settings = await getPublicSettings();

  return (
    <>
      {settings.metaPixelId && <MetaPixel pixelId={settings.metaPixelId} locale={locale} />}
      {settings.googlePixelId && <GooglePixel pixelId={settings.googlePixelId} locale={locale} />}
      {settings.tiktokPixelId && <TikTokPixel pixelId={settings.tiktokPixelId} />}
    </>
  );
}
