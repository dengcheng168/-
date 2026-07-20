import { getPublicSettings } from '@/lib/api/settings';
import { MetaPixel } from './MetaPixel';
import { GooglePixel } from './GooglePixel';
import { TikTokPixel } from './TikTokPixel';

/**
 * 只在后台"像素设置"里填了对应 ID 时才注入脚本；没填的平台完全不加载，不会有空脚本标签。
 * 目前只接了 Meta / Google / TikTok 三家（用户明确要求的范围），"推特（X）像素"字段还在，
 * 但没有对应组件——按需要接入时再补，现在填了也不会生效。
 */
export async function AnalyticsPixels() {
  const settings = await getPublicSettings();

  return (
    <>
      {settings.metaPixelId && <MetaPixel pixelId={settings.metaPixelId} />}
      {settings.googlePixelId && <GooglePixel pixelId={settings.googlePixelId} />}
      {settings.tiktokPixelId && <TikTokPixel pixelId={settings.tiktokPixelId} />}
    </>
  );
}
