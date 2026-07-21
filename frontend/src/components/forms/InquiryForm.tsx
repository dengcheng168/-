'use client';

import { useActionState } from 'react';
import { submitInquiryAction, type InquiryFormState } from '@/lib/actions/inquiry';
import { t } from '@/lib/i18n/site-strings';
import type { Locale } from '@/lib/i18n/locales';
import { Honeypot } from './Honeypot';

const initialState: InquiryFormState = {};

const inputClasses =
  'w-full rounded-md border border-grey-200 px-3 py-2 text-sm text-navy-950 placeholder:text-grey-500 focus:border-water-500 focus:outline-none focus:ring-1 focus:ring-water-500';

export function InquiryForm({
  sourcePage,
  defaultProductName,
  locale = 'en',
}: {
  sourcePage: string;
  defaultProductName?: string;
  locale?: Locale;
}) {
  const [state, formAction, pending] = useActionState(submitInquiryAction, initialState);

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
          <input id="name" name="name" required className={inputClasses} />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-navy-950">
            {t(locale, 'formEmailLabel')} <span className="text-red-500">*</span>
          </label>
          <input id="email" name="email" type="email" required className={inputClasses} />
        </div>
        <div>
          <label htmlFor="company" className="mb-1 block text-sm font-medium text-navy-950">
            {t(locale, 'formCompanyLabel')}
          </label>
          <input id="company" name="company" className={inputClasses} />
        </div>
        <div>
          <label htmlFor="country" className="mb-1 block text-sm font-medium text-navy-950">
            {t(locale, 'formCountryLabel')}
          </label>
          <input id="country" name="country" className={inputClasses} />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-navy-950">
            {t(locale, 'formPhoneLabel')}
          </label>
          <input id="phone" name="phone" className={inputClasses} />
        </div>
        <div>
          <label htmlFor="whatsapp" className="mb-1 block text-sm font-medium text-navy-950">
            {t(locale, 'formWhatsappLabel')}
          </label>
          <input id="whatsapp" name="whatsapp" className={inputClasses} />
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

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-md bg-water-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-water-600 disabled:opacity-60"
      >
        {pending ? t(locale, 'formSubmitting') : t(locale, 'formSubmitButton')}
      </button>
    </form>
  );
}
