import Image from 'next/image';
import Link from 'next/link';
import type { BlogPost } from '@/types/blog';
import type { Locale } from '@/lib/i18n/locales';
import { localeHref } from '@/lib/i18n/paths';

function formatDate(dateStr: string | null, locale: Locale) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function BlogCard({ post, locale = 'en' }: { post: BlogPost; locale?: Locale }) {
  return (
    <Link
      href={localeHref(`/blog/${post.slug}`, locale)}
      className="group flex flex-col overflow-hidden rounded-lg border border-grey-200 bg-white transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-grey-50">
        {post.coverImage && (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {post.category && (
          <span className="text-xs font-medium uppercase tracking-wide text-water-600">{post.category.name}</span>
        )}
        <h3 className="mt-1 text-base font-semibold text-navy-950">{post.title}</h3>
        {post.excerpt && <p className="mt-2 line-clamp-2 text-sm text-grey-500">{post.excerpt}</p>}
        <p className="mt-3 text-xs text-grey-500">{formatDate(post.publishedAt, locale)}</p>
      </div>
    </Link>
  );
}
