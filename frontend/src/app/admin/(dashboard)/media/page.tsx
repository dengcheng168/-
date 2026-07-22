import Image from 'next/image';
import Link from 'next/link';
import { adminFetch } from '@/lib/api/admin-client';
import { resolveMediaUrl } from '@/lib/utils/media';
import { PageHeader } from '@/components/admin/PageHeader';
import { Badge } from '@/components/admin/ui/badge';
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
  inUse: boolean;
  usageCount: number;
}

export default async function AdminMediaPage() {
  const { data } = await adminFetch<MediaItem[]>('/media?pageSize=100');

  return (
    <div>
      <PageHeader
        title="媒体库"
        description="管理网站上传使用的图片与文件。绿色「使用中」表示该文件仍被产品/文章/证书/页面/首页设置等内容引用；灰色「未使用」的文件可以放心删除。"
        action={
          <div className="flex items-center gap-3">
            <Link href="/admin/media/unused" className="text-sm text-water-600 hover:underline">
              查看未使用媒体
            </Link>
            <MediaUploadButton />
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
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
              <div className="mt-1 flex items-center justify-between">
                <p className="text-xs text-grey-500">{(item.size / 1024).toFixed(0)} KB</p>
                <Badge
                  variant={item.inUse ? 'success' : 'muted'}
                  title={item.inUse ? `被 ${item.usageCount} 处内容引用` : '当前没有内容引用此文件'}
                >
                  {item.inUse ? '使用中' : '未使用'}
                </Badge>
              </div>
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
