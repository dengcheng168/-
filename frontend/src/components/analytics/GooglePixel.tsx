import Script from 'next/script';
import type { Locale } from '@/lib/i18n/locales';
import { buildGoogleTags } from '@/lib/analytics/google-tags';

/**
 * GA4 与 Ads 使用独立 ID、共享一个 gtag.js 加载器。
 * 此处只有基础 config，不发送询盘/购买 conversion 事件。
 */
export function GooglePixel({ ga4Id, adsId, locale = 'en' }: { ga4Id?: string | null; adsId?: string | null; locale?: Locale }) {
  const tags = buildGoogleTags(ga4Id, adsId, locale);
  if (!tags) return null;
  return (
    <>
      <Script src={tags.src} strategy="lazyOnload" />
      <Script id="google-pixel" strategy="lazyOnload">
        {tags.script}
      </Script>
    </>
  );
}
