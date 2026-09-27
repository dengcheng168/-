/**
 * The exact browser bootstrap used by MetaPixel. Keeping it here makes the
 * inline Next Script independently executable in the lightweight regression
 * harness without replacing it with a second, simplified implementation.
 */
export function buildMetaPixelBootstrap(pixelId: string): string {
  return `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    window.__META_PIXEL_ID__ = '${pixelId}';
    fbq('init', '${pixelId}');
    // Meta normally creates _fbc itself after an ad click. Persist it here as
    // a first-party fallback so an immediate server action can still forward
    // the click id to CAPI before fbevents.js has finished loading.
    var metaFbclid = new URLSearchParams(window.location.search || '').get('fbclid');
    if (metaFbclid && /^[A-Za-z0-9_-]{1,500}$/.test(metaFbclid) && !/(?:^|;\\s*)_fbc=/.test(document.cookie || '')) {
      var metaFbc = 'fb.1.' + Date.now() + '.' + metaFbclid;
      document.cookie = '_fbc=' + encodeURIComponent(metaFbc)
        + '; Path=/; Max-Age=7776000; SameSite=Lax'
        + (window.location.protocol === 'https:' ? '; Secure' : '');
    }
    function metaEventId(prefix) {
      return prefix + '_' + (
        window.crypto && typeof window.crypto.randomUUID === 'function'
          ? window.crypto.randomUUID()
          : Date.now().toString(36) + '_' + Math.random().toString(36).slice(2)
      );
    }
    window.__META_PIXEL_READY__ = true;
    window.dispatchEvent(new Event('meta-pixel-ready'));
    document.addEventListener('click', function(event) {
      var target = event.target;
      if (!(target instanceof Element)) return;
      var link = target.closest('a');
      if (!link || typeof window.fbq !== 'function') return;
      var href = link.href || '';
      var productMatch = window.location.pathname.match(/^\\/(?:es\\/)?products\\/([^/]+)$/);
      var contactContext = {
        page_path: window.location.pathname,
        contact_location: link.getAttribute('data-meta-contact-location') || link.getAttribute('aria-label') || 'link',
        ...(productMatch ? { content_type: 'product', content_ids: [decodeURIComponent(productMatch[1])] } : {})
      };
      if (href.indexOf('wa.me/') !== -1 || href.indexOf('whatsapp') !== -1) {
        window.fbq('track', 'Contact', { ...contactContext, contact_method: 'whatsapp_link' }, { eventID: metaEventId('contact') });
      } else if (href.indexOf('mailto:') === 0) {
        window.fbq('track', 'Contact', { ...contactContext, contact_method: 'email_link' }, { eventID: metaEventId('contact') });
      } else if (href.indexOf('tel:') === 0) {
        window.fbq('track', 'Contact', { ...contactContext, contact_method: 'phone_link' }, { eventID: metaEventId('contact') });
      }
    });
  `;
}
