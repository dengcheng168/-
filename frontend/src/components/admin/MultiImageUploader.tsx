'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageCropper } from './ImageCropper';

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

      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <div key={`${img.url}-${i}`} className="relative h-20 w-20 overflow-hidden rounded-md border border-grey-200 bg-grey-50">
            <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
            <button
              type="button"
              onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
              className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
            >
              ×
            </button>
          </div>
        ))}
      </div>

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
            const filename = blob instanceof File ? blob.name : pendingFile.name.replace(/\.\w+$/, '.webp');
            void uploadFile(blob, filename);
            setPendingFile(null);
          }}
        />
      )}
    </div>
  );
}
