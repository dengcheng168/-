import { getPublicSettings } from '@/lib/api/settings';
import { MetaPixel } from './MetaPixel';
import { GooglePixel } from './GooglePixel';
import { TikTokPixel } from './TikTokPixel';
import { TwitterPixel } from './TwitterPixel';

/** 只在后台"像素设置"里填了对应 ID 时才注入脚本；没填的平台完全不加载，不会有空脚本标签。 */
export async function AnalyticsPixels() {
  const settings = await getPublicSettings();

  return (
    <>
      {settings.metaPixelId && <MetaPixel pixelId={settings.metaPixelId} />}
      {settings.googlePixelId && <GooglePixel pixelId={settings.googlePixelId} />}
      {settings.tiktokPixelId && <TikTokPixel pixelId={settings.tiktokPixelId} />}
      {settings.twitterPixelId && <TwitterPixel pixelId={settings.twitterPixelId} />}
    </>
  );
}
