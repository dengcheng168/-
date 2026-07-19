'use client';

import { useState } from 'react';

export function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="text-xs text-water-600 hover:underline"
    >
      {copied ? '已复制' : '复制地址'}
    </button>
  );
}
