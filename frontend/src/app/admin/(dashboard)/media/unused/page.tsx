import Image from 'next/image';
import Link from 'next/link';
import { adminFetch } from '@/lib/api/admin-client';
import { resolveMediaUrl } from '@/lib/utils/media';
import { PageHeader } from '@/components/admin/PageHeader';
import { MediaDeleteButton } from '../MediaDeleteButton';

interface MediaItem {
  id: number;
  url: string;
  thumbnailUrl: string | null;
  originalName: string;
  mimeType: string;
  size: number;
}

export default async function AdminUnusedMediaPage() {
  const { data } = await adminFetch<MediaItem[]>('/media/unused');

  return (
    <div>
      <PageHeader
        title="未使用媒体"
        description={`当前没有被任何产品/文章/证书/页面/首页设置引用的文件，共 ${data.length} 个。可以放心删除；如果某个文件其实还在用但被漏检，删除时会再次校验并阻止。`}
        action={
          <Link href="/admin/media" className="text-sm text-water-600 hover:underline">
            返回全部媒体
          </Link>
        }
      />

      {data.length === 0 ? (
        <p className="text-grey-500">没有未使用的媒体文件。</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {data.map((item) => {
            const isImage = item.mimeType.startsWith('image/');
            const previewUrl = resolveMediaUrl(item.thumbnailUrl ?? item.url);
            return (
              <div key={item.id} className="rounded-lg border border-grey-200 bg-white p-2">
                <div className="relative aspect-square overflow-hidden rounded bg-grey-50">
                  {isImage ? (
                    <Image src={previewUrl} alt="" fill sizes="150px" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-grey-500">PDF</div>
                  )}
                </div>
                <p className="mt-2 truncate text-xs text-grey-700" title={item.originalName}>
                  {item.originalName}
                </p>
                <p className="text-xs text-grey-500">{(item.size / 1024).toFixed(0)} KB</p>
                <div className="mt-2 flex items-center justify-end">
                  <MediaDeleteButton id={item.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
