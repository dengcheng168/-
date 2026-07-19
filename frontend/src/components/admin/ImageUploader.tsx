'use client';

import { useState } from 'react';
import Image from 'next/image';

export function ImageUploader({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label?: string;
  defaultValue?: string | null;
}) {
  const [url, setUrl] = useState(defaultValue ?? '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/media/upload', { method: 'POST', body: formData });
      const body = await res.json();

      if (!res.ok || !body.success) {
        setError(body?.error?.message ?? '上传失败');
        return;
      }

      setUrl(body.data.webpUrl || body.data.url);
    } catch {
      setError('上传失败，请检查网络连接');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div>
      {label && <label className="mb-1 block text-sm font-medium text-navy-950">{label}</label>}
      <input type="hidden" name={name} value={url} />

      <div className="flex items-center gap-4">
        {url ? (
          <div className="relative h-20 w-20 overflow-hidden rounded-md border border-grey-200 bg-grey-50">
            <Image src={url} alt="" fill sizes="80px" className="object-cover" />
          </div>
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed border-grey-200 text-xs text-grey-500">
            无图片
          </div>
        )}

        <div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
            onChange={handleFileChange}
            disabled={uploading}
            className="text-sm text-grey-700"
          />
          {uploading && <p className="mt-1 text-xs text-grey-500">上传中...</p>}
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          {url && (
            <button type="button" onClick={() => setUrl('')} className="mt-1 text-xs text-red-600 hover:underline">
              移除图片
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
