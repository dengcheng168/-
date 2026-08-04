'use client';

import { useState } from 'react';

/**
 * 点击前只显示缩略图 + 品牌色播放按钮，不加载 YouTube 官方 iframe/UI（分享、稍后观看图标等
 * 跟网站视觉风格不搭）。点击后才换成真正的 iframe 播放，同时也是常见的懒加载优化手段。
 */
export function YoutubeFacade({ videoId, title }: { videoId: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        title={title}
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
      onClick={() => setPlaying(true)}
      aria-label={title}
      className="group relative h-full w-full"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- 跨域缩略图，不走 next/image 优化管线 */}
      <img
        src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
      />
      <span className="absolute inset-0 bg-navy-950/20 transition-colors group-hover:bg-navy-950/35" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-water-500 text-white shadow-lg transition-transform group-hover:scale-110 sm:h-20 sm:w-20">
          <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-7 w-7 sm:h-8 sm:w-8">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
