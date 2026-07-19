'use client';

import { useActionState } from 'react';
import { submitInquiryAction, type InquiryFormState } from '@/lib/actions/inquiry';
import { Honeypot } from './Honeypot';

const initialState: InquiryFormState = {};

const inputClasses =
  'w-full rounded-md border border-grey-200 px-3 py-2 text-sm text-navy-950 placeholder:text-grey-500 focus:border-water-500 focus:outline-none focus:ring-1 focus:ring-water-500';

export function InquiryForm({
  sourcePage,
  defaultProductName,
}: {
  sourcePage: string;
  defaultProductName?: string;
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
      <Honeypot />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-navy-950">
            Name <span className="text-red-500">*</span>
          </label>
          <input id="name" name="name" required className={inputClasses} />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-navy-950">
            Email <span className="text-red-500">*</span>
          </label>
          <input id="email" name="email" type="email" required className={inputClasses} />
        </div>
        <div>
          <label htmlFor="company" className="mb-1 block text-sm font-medium text-navy-950">
            Company
          </label>
          <input id="company" name="company" className={inputClasses} />
        </div>
        <div>
          <label htmlFor="country" className="mb-1 block text-sm font-medium text-navy-950">
            Country / Region
          </label>
          <input id="country" name="country" className={inputClasses} />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-navy-950">
            Phone
          </label>
          <input id="phone" name="phone" className={inputClasses} />
        </div>
        <div>
          <label htmlFor="whatsapp" className="mb-1 block text-sm font-medium text-navy-950">
            WhatsApp
          </label>
          <input id="whatsapp" name="whatsapp" className={inputClasses} />
        </div>
        <div>
          <label htmlFor="productName" className="mb-1 block text-sm font-medium text-navy-950">
            Product of Interest
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
            Quantity
          </label>
          <input id="quantity" name="quantity" className={inputClasses} />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-navy-950">
          Message
        </label>
        <textarea id="message" name="message" rows={4} className={inputClasses} />
      </div>

      {state.message && !state.success && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-md bg-water-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-water-600 disabled:opacity-60"
      >
        {pending ? 'Submitting...' : 'Submit Inquiry'}
      </button>
    </form>
  );
}
