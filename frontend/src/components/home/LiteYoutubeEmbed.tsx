'use client';

import { useState } from 'react';
import type { Locale } from '@/lib/i18n/locales';

export function LiteYoutubeEmbed({ videoId, locale = 'en' }: { videoId: string; locale?: Locale }) {
  const [playing, setPlaying] = useState(false);
  const label = locale === 'es' ? 'Reproducir video' : 'Play video';

  if (playing) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
        title="YouTube video player"
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => setPlaying(true)}
      className="group relative h-full w-full overflow-hidden bg-navy-950 text-white"
    >
      {/* The thumbnail is a fixed YouTube CDN URL and this deployment bypasses
          Next's image optimizer, so a native lazy image avoids extra runtime. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      />
      <span className="absolute inset-0 bg-navy-950/25 transition-colors group-hover:bg-navy-950/15" />
      <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600 shadow-lg transition-transform group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8" fill="currentColor" aria-hidden="true">
          <path d="M8 5v14l11-7Z" />
        </svg>
      </span>
    </button>
  );
}
