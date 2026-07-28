'use client';

import { useState } from 'react';
import Image from 'next/image';
import { resolveMediaUrl } from '@/lib/utils/media';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/admin/ui/dialog';

interface MediaLibraryItem {
  id: number;
  url: string;
  webpUrl: string | null;
  thumbnailUrl: string | null;
  originalName: string;
  mimeType: string;
  altText: string | null;
}

export function MediaLibraryPicker({ onSelect }: { onSelect: (url: string) => void }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaLibraryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadMedia() {
    if (items !== null) return;
    setError(null);
    try {
      const res = await fetch('/auth/admin/proxy/media?pageSize=100');
      const body = await res.json();
      if (!res.ok || !body.success) {
        setError(body?.error?.message ?? '加载媒体库失败');
        return;
      }
      const media = (body.data as MediaLibraryItem[]).filter((item) => item.mimeType.startsWith('image/'));
      setItems(media);
    } catch {
      setError('加载媒体库失败，请检查网络连接');
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) void loadMedia();
      }}
    >
      <DialogTrigger asChild>
        <button type="button" className="text-xs font-medium text-water-600 hover:underline">
          从媒体库选择
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>从媒体库选择图片</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!error && items === null && <p className="text-sm text-grey-500">加载中...</p>}
          {items !== null && items.length === 0 && (
            <p className="text-sm text-grey-500">媒体库暂无图片，请先在媒体库上传。</p>
          )}
          {items !== null && items.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {items.map((item) => {
                const resolvedUrl = resolveMediaUrl(item.webpUrl || item.url);
                return (
                  <div key={item.id} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(item.webpUrl || item.url);
                        setOpen(false);
                      }}
                      className="group relative block aspect-square w-full overflow-hidden rounded-md border border-grey-200 bg-grey-50 hover:border-water-500"
                      title={item.originalName}
                    >
                      <Image
                        src={resolveMediaUrl(item.thumbnailUrl ?? item.url)}
                        alt={item.altText ?? item.originalName}
                        fill
                        sizes="120px"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </button>
                    <CopyLinkButton url={resolvedUrl} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** 复制图片完整地址，供管理员粘贴到富文本/HTML源码里手动插图，跟"选择"这个操作互不影响 */
function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="block w-full truncate text-center text-[11px] text-water-600 hover:underline"
      title={url}
    >
      {copied ? '已复制' : '复制链接'}
    </button>
  );
}
