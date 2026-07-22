import Script from 'next/script';
import type { Locale } from '@/lib/i18n/locales';

/**
 * 通用 gtag.js 接入：ID 可以是 GA4 Measurement ID（G-xxx）也可以是 Google Ads 转化 ID（AW-xxx），
 * gtag.js 会根据 ID 前缀自己识别，这里不用区分两种场景各写一套代码。
 */
export function GooglePixel({ pixelId, locale = 'en' }: { pixelId: string; locale?: Locale }) {
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${pixelId}`} strategy="afterInteractive" />
      <Script id="google-pixel" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${pixelId}', { page_language: '${locale}' });
        `}
      </Script>
    </>
  );
}
