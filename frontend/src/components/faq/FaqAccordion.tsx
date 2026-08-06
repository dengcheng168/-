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
            {/* 答案始终留在服务端 HTML 里（只用 CSS 隐藏未展开的），这样 JS 没加载/执行失败时
                手风琴退化成一份可读的静态问答列表，而不是只剩问题、答案整段从 DOM 里消失 */}
            <p className={`px-5 pb-4 text-sm text-grey-500 ${isOpen ? 'animate-fade-in block' : 'hidden'}`}>{faq.answer}</p>
          </div>
        );
      })}
    </div>
  );
}
