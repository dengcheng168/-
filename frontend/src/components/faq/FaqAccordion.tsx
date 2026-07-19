'use client';

import { useState } from 'react';
import type { Faq } from '@/types/content';

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<number | null>(faqs[0]?.id ?? null);

  return (
    <div className="divide-y divide-grey-200 rounded-lg border border-grey-200 bg-white">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div key={faq.id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-navy-950"
            >
              {faq.question}
              <span className={`shrink-0 transition-transform ${isOpen ? 'rotate-45' : ''}`} aria-hidden="true">
                +
              </span>
            </button>
            {isOpen && <p className="animate-fade-in px-5 pb-4 text-sm text-grey-500">{faq.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}
