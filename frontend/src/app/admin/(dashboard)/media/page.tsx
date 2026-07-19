import Image from 'next/image';
import { adminFetch } from '@/lib/api/admin-client';
import { resolveMediaUrl } from '@/lib/utils/media';
import { MediaUploadButton } from './MediaUploadButton';
import { MediaDeleteButton } from './MediaDeleteButton';
import { MediaAltForm } from './MediaAltForm';
import { CopyUrlButton } from './CopyUrlButton';

interface MediaItem {
  id: number;
  url: string;
  thumbnailUrl: string | null;
  originalName: string;
  mimeType: string;
  altText: string | null;
  size: number;
}

export default async function AdminMediaPage() {
  const { data } = await adminFetch<MediaItem[]>('/media?pageSize=100');

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-navy-950">媒体库</h1>
        <MediaUploadButton />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {data.length === 0 && <p className="text-grey-500">暂无媒体文件</p>}
        {data.map((item) => {
          const isImage = item.mimeType.startsWith('image/');
          const previewUrl = resolveMediaUrl(item.thumbnailUrl ?? item.url);
          return (
            <div key={item.id} className="rounded-lg border border-grey-200 bg-white p-2">
              <div className="relative aspect-square overflow-hidden rounded bg-grey-50">
                {isImage ? (
                  <Image src={previewUrl} alt={item.altText ?? ''} fill sizes="150px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-grey-500">PDF</div>
                )}
              </div>
              <p className="mt-2 truncate text-xs text-grey-700" title={item.originalName}>
                {item.originalName}
              </p>
              <p className="text-xs text-grey-500">{(item.size / 1024).toFixed(0)} KB</p>
              {isImage && <MediaAltForm id={item.id} altText={item.altText} />}
              <div className="mt-2 flex items-center justify-between">
                <CopyUrlButton url={resolveMediaUrl(item.url)} />
                <MediaDeleteButton id={item.id} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
