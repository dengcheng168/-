'use client';

import { useActionState, useEffect, useState } from 'react';
import { TurnstileWidget } from './TurnstileWidget';
import { submitInquiryAction, type InquiryFormState } from '@/lib/actions/inquiry';
import { t } from '@/lib/i18n/site-strings';
import type { Locale } from '@/lib/i18n/locales';
import { Honeypot } from './Honeypot';
import { waitForMetaPixelReady } from '@/lib/analytics/meta-events';

const initialState: InquiryFormState = {};

const inputClasses =
  'min-h-11 w-full rounded-md border border-grey-200 px-3 py-2 text-sm text-navy-950 placeholder:text-grey-500 focus:border-water-500 focus:outline-none focus:ring-1 focus:ring-water-500';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    __META_PIXEL_ID__?: string;
  }
}

export function InquiryForm({
  sourcePage,
  defaultProductName,
  locale = 'en',
  turnstileEnabled = false,
  turnstileSiteKey,
}: {
  sourcePage: string;
  defaultProductName?: string;
  locale?: Locale;
  turnstileEnabled?: boolean;
  turnstileSiteKey?: string | null;
}) {
  const [state, formAction, pending] = useActionState(submitInquiryAction, initialState);
  const [token, setToken] = useState('');

  useEffect(() => {
    if (!state.success || !state.metaEventId) return;

    const send = () => {
      if (typeof window.fbq !== 'function') return;
      window.fbq(
        'track',
        'Lead',
        {
          lead_type: 'B2B_inquiry_form_submission',
          content_name: defaultProductName || 'general_inquiry',
          page_language: locale,
          source_page: sourcePage,
        },
        { eventID: state.metaEventId },
      );
    };

    return waitForMetaPixelReady({
      isReady: () => !!window.__META_PIXEL_READY__ && typeof window.fbq === 'function',
      addReadyListener: (listener) => window.addEventListener('meta-pixel-ready', listener, { once: true }),
      removeReadyListener: (listener) => window.removeEventListener('meta-pixel-ready', listener),
      send,
    });
  }, [defaultProductName, locale, sourcePage, state.success, state.metaEventId]);

  if (state.success) {
    return (
      <div className="rounded-md border border-water-500/30 bg-water-100 p-6 text-center text-navy-950">
        {state.message}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="sourcePage" value={sourcePage} />
      <input type="hidden" name="locale" value={locale} />
      <Honeypot />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-navy-950">
            {t(locale, 'formNameLabel')} <span className="text-red-500">*</span>
          </label>
          <input id="name" name="name" autoComplete="name" required className={inputClasses} />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-navy-950">
            {t(locale, 'formEmailLabel')} <span className="text-red-500">*</span>
          </label>
          <input id="email" name="email" type="email" autoComplete="email" required className={inputClasses} />
        </div>
        <div>
          <label htmlFor="company" className="mb-1 block text-sm font-medium text-navy-950">
            {t(locale, 'formCompanyLabel')}
          </label>
          <input id="company" name="company" autoComplete="organization" className={inputClasses} />
        </div>
        <div>
          <label htmlFor="country" className="mb-1 block text-sm font-medium text-navy-950">
            {t(locale, 'formCountryLabel')}
          </label>
          <input id="country" name="country" autoComplete="country-name" className={inputClasses} />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-navy-950">
            {t(locale, 'formPhoneLabel')}
          </label>
          <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" className={inputClasses} />
        </div>
        <div>
          <label htmlFor="whatsapp" className="mb-1 block text-sm font-medium text-navy-950">
            {t(locale, 'formWhatsappLabel')}
          </label>
          <input id="whatsapp" name="whatsapp" type="tel" inputMode="tel" className={inputClasses} />
        </div>
        <div>
          <label htmlFor="productName" className="mb-1 block text-sm font-medium text-navy-950">
            {t(locale, 'formProductLabel')}
          </label>
          <input
            id="productName"
            name="productName"
            defaultValue={defaultProductName}
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="quantity" className="mb-1 block text-sm font-medium text-navy-950">
            {t(locale, 'formQuantityLabel')}
          </label>
          <input id="quantity" name="quantity" className={inputClasses} />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-navy-950">
          {t(locale, 'formMessageLabel')}
        </label>
        <textarea id="message" name="message" rows={4} className={inputClasses} />
      </div>

      {state.message && !state.success && <p className="text-sm text-red-600">{state.message}</p>}

      {turnstileEnabled && <>
        <input type="hidden" name="cf-turnstile-response" value={token} />
        {turnstileSiteKey ? <TurnstileWidget siteKey={turnstileSiteKey} locale={locale} resetSignal={state} onToken={setToken} />
          : <p role="alert" className="text-sm text-red-600">{t(locale, 'formGenericError')}</p>}
      </>}

      <button
        type="submit"
        disabled={pending || (turnstileEnabled && !token)}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-water-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-water-600 disabled:opacity-60 sm:w-auto"
      >
        {pending ? t(locale, 'formSubmitting') : t(locale, 'formSubmitButton')}
      </button>
    </form>
  );
}
