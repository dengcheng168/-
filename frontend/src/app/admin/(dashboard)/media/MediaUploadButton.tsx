'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function MediaUploadButton() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
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
      router.refresh();
    } catch {
      setError('上传失败，请检查网络连接');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div>
      <label className="inline-flex cursor-pointer items-center rounded-md bg-water-500 px-4 py-2 text-sm font-medium text-white hover:bg-water-600">
        {uploading ? '上传中...' : '+ 上传文件'}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml,application/pdf"
          onChange={handleChange}
          disabled={uploading}
          className="hidden"
        />
      </label>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
