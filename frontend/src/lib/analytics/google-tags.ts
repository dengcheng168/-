export function isGoogleTagId(value: string, kind: 'ga4' | 'ads'): boolean {
  return value.length <= 64 && (kind === 'ga4' ? /^G-[A-Z0-9]+$/ : /^AW-\d+$/).test(value);
}

/** Invalid stored values must never become executable script or a loader URL. */
export function buildGoogleTags(ga4Id?: string | null, adsId?: string | null, locale = 'en') {
  const ids = [
    isGoogleTagId(ga4Id?.trim() ?? '', 'ga4') ? ga4Id!.trim() : '',
    isGoogleTagId(adsId?.trim() ?? '', 'ads') ? adsId!.trim() : '',
  ].filter(Boolean);
  if (!ids.length) return null;
  const language = locale === 'es' ? 'es' : 'en';
  return {
    src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ids[0])}`,
    script: [
      'window.dataLayer = window.dataLayer || [];',
      'function gtag(){dataLayer.push(arguments);}',
      "gtag('js', new Date());",
      ...ids.map((id) => `gtag('config', ${JSON.stringify(id)}, ${JSON.stringify({ page_language: language })});`),
    ].join('\n'),
  };
}
