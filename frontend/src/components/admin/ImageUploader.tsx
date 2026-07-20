'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageCropper } from './ImageCropper';

const RASTER_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export function ImageUploader({
  name,
  label,
  defaultValue,
  recommendedSize,
  aspectRatio,
}: {
  name: string;
  label?: string;
  defaultValue?: string | null;
  /** 展示给管理员的尺寸建议文案，例如 "建议 1200×630px" */
  recommendedSize?: string;
  /** 宽/高，传了才会在选择图片后弹出裁剪框；未传（例如 Logo）则跟以前一样直接上传原图 */
  aspectRatio?: number;
}) {
  const [url, setUrl] = useState(defaultValue ?? '');
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

      setUrl(body.data.webpUrl || body.data.url);
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

      {pendingFile && aspectRatio && (
        <ImageCropper
          file={pendingFile}
          aspectRatio={aspectRatio}
          onCancel={() => setPendingFile(null)}
          onConfirm={(blob) => {
            // "跳过裁剪"时 onConfirm 会直接收到原始 File（保留原文件名和格式）；
            // 真正裁剪后的结果固定输出成 webp，需要把文件名后缀换掉
            const filename = blob instanceof File ? blob.name : pendingFile.name.replace(/\.\w+$/, '.webp');
            void uploadFile(blob, filename);
            setPendingFile(null);
          }}
        />
      )}
    </div>
  );
}
