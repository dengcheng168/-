'use client';

import { useState } from 'react';
import Image from 'next/image';
import { resolveMediaUrl } from '@/lib/utils/media';
import { ImageCropper } from './ImageCropper';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';

const RASTER_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

interface GalleryImage {
  url: string;
  alt?: string;
}

export function MultiImageUploader({
  name,
  label,
  defaultValue,
  recommendedSize,
  aspectRatio,
}: {
  name: string;
  label?: string;
  defaultValue?: GalleryImage[];
  recommendedSize?: string;
  aspectRatio?: number;
}) {
  const [images, setImages] = useState<GalleryImage[]>(defaultValue ?? []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function moveImage(from: number, to: number) {
    if (from === to) return;
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  async function uploadFile(fileOrBlob: File | Blob, filename: string) {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', fileOrBlob, filename);
      const res = await fetch('/api/admin/media/upload', { method: 'POST', body: formData });
      const body = await res.json();

      if (!res.ok || !body.success) {
        setError(body?.error?.message ?? '上传失败');
        return;
      }
      setImages((prev) => [...prev, { url: body.data.webpUrl || body.data.url, alt: '' }]);
    } catch {
      setError('上传失败，请检查网络连接');
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (aspectRatio && RASTER_TYPES.has(file.type)) {
      setPendingFile(file);
      return;
    }

    void uploadFile(file, file.name);
  }

  return (
    <div>
      {label && <label className="mb-1 block text-sm font-medium text-navy-950">{label}</label>}
      {recommendedSize && <p className="mb-1 text-xs text-grey-500">{recommendedSize}</p>}
      <input type="hidden" name={name} value={JSON.stringify(images)} />

      {images.length > 1 && <p className="mb-1.5 text-xs text-grey-500">拖动缩略图可调整顺序，点击图片可查看原图</p>}
      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <div
            key={`${img.url}-${i}`}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (dragIndex !== null) moveImage(dragIndex, i);
              setDragIndex(null);
            }}
            onDragEnd={() => setDragIndex(null)}
            className={`relative h-20 w-20 shrink-0 cursor-move overflow-hidden rounded-md border bg-grey-50 transition-opacity ${
              dragIndex === i ? 'border-water-500 opacity-40' : 'border-grey-200'
            }`}
          >
            <button
              type="button"
              onClick={() => setPreviewUrl(img.url)}
              className="relative block h-full w-full cursor-zoom-in"
            >
              <Image src={resolveMediaUrl(img.url)} alt="" fill sizes="80px" className="object-cover" />
            </button>
            <button
              type="button"
              onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
              className="absolute right-0.5 top-0.5 z-30 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <Dialog open={previewUrl !== null} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="max-w-3xl">
          <DialogTitle className="sr-only">图片预览</DialogTitle>
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- 原图预览需要按图片原始尺寸展示，不适合用 next/image
            <img
              src={resolveMediaUrl(previewUrl)}
              alt=""
              className="max-h-[75vh] w-full rounded-md object-contain"
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="mt-2">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleFileChange}
          disabled={uploading}
          className="text-sm text-grey-700"
        />
        {uploading && <p className="mt-1 text-xs text-grey-500">上传中...</p>}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>

      {pendingFile && aspectRatio && (
        <ImageCropper
          file={pendingFile}
          aspectRatio={aspectRatio}
          onCancel={() => setPendingFile(null)}
          onConfirm={(blob) => {
            void uploadFile(blob, pendingFile.name.replace(/\.\w+$/, '.webp'));
            setPendingFile(null);
          }}
        />
      )}
    </div>
  );
}
