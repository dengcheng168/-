'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/admin/ui/button';

// 与后端 backend/src/config/constants.ts 的 MAX_BATCH_UPLOAD_FILES 保持一致
const MAX_FILES = 10;
const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif,image/svg+xml,application/pdf';

interface UploadedItem {
  id: number;
  originalName: string;
}
interface UploadError {
  filename: string;
  message: string;
}

export function BatchUploadForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ uploaded: UploadedItem[]; errors: UploadError[] } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  function addFiles(list: FileList | File[]) {
    const incoming = Array.from(list);
    setFiles((prev) => {
      const combined = [...prev, ...incoming];
      if (combined.length > MAX_FILES) {
        setFormError(`一次最多选择 ${MAX_FILES} 个文件，已只保留前 ${MAX_FILES} 个。`);
        return combined.slice(0, MAX_FILES);
      }
      setFormError(null);
      return combined;
    });
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleUpload() {
    if (files.length === 0) return;
    setUploading(true);
    setResult(null);
    setFormError(null);
    try {
      const formData = new FormData();
      for (const file of files) formData.append('files', file);
      const res = await fetch('/api/admin/media/upload-batch', { method: 'POST', body: formData });
      const body = await res.json();
      if (!res.ok || !body.success) {
        setFormError(body?.error?.message ?? '上传失败');
        return;
      }
      setResult(body.data);
      setFiles([]);
      if (inputRef.current) inputRef.current.value = '';
    } catch {
      setFormError('上传失败，请检查网络连接');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 text-center transition-colors ${
          dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
        }`}
      >
        <p className="text-sm font-medium text-foreground">点击选择文件，或拖拽文件到这里</p>
        <p className="mt-1 text-xs text-muted-foreground">支持 JPG / PNG / WebP / AVIF / SVG / PDF，一次最多 {MAX_FILES} 个</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
          }}
        />
      </div>

      {files.length > 0 && (
        <ul className="space-y-1 rounded-lg border border-border bg-card p-3">
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`} className="flex items-center justify-between text-sm text-foreground">
              <span className="truncate">{file.name}</span>
              <button type="button" onClick={() => removeFile(i)} className="ml-2 shrink-0 text-xs text-destructive hover:underline">
                移除
              </button>
            </li>
          ))}
        </ul>
      )}

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <Button type="button" onClick={handleUpload} disabled={files.length === 0 || uploading}>
        {uploading ? '上传中...' : `上传${files.length > 0 ? ` ${files.length} 个文件` : ''}`}
      </Button>

      {result && (
        <div className="rounded-lg border border-border bg-card p-4 text-sm">
          {result.uploaded.length > 0 && (
            <p className="text-green-600 dark:text-green-400">
              已成功上传 {result.uploaded.length} 个文件：{result.uploaded.map((u) => u.originalName).join('、')}
            </p>
          )}
          {result.errors.length > 0 && (
            <div className="mt-2 text-destructive">
              {result.errors.length} 个文件上传失败：
              <ul className="mt-1 list-disc pl-5">
                {result.errors.map((err, i) => (
                  <li key={i}>
                    {err.filename}：{err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Link href="/admin/media" className="mt-3 inline-block text-primary hover:underline">
            前往全部媒体查看
          </Link>
        </div>
      )}
    </div>
  );
}
