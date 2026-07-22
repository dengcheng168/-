import Link from 'next/link';
import type { BlogCategory, BlogTag } from '@/types/blog';
import type { Locale } from '@/lib/i18n/locales';
import { t } from '@/lib/i18n/site-strings';
import { localeHref } from '@/lib/i18n/paths';

export function BlogSidebar({
  categories,
  tags,
  activeCategorySlug,
  activeTagSlug,
  locale = 'en',
}: {
  categories: BlogCategory[];
  tags: BlogTag[];
  activeCategorySlug?: string;
  activeTagSlug?: string;
  locale?: Locale;
}) {
  return (
    <aside className="space-y-8">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-grey-700">{t(locale, 'blogCategoriesLabel')}</h2>
        <nav className="mt-3 space-y-1">
          <Link
            href={localeHref('/blog', locale)}
            className={`block rounded-md px-3 py-2 text-sm font-medium ${
              !activeCategorySlug ? 'bg-navy-900 text-white' : 'text-navy-900 hover:bg-grey-100'
            }`}
          >
            {t(locale, 'allPosts')}
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={localeHref(`/blog/category/${category.slug}`, locale)}
              className={`block rounded-md px-3 py-2 text-sm font-medium ${
                activeCategorySlug === category.slug ? 'bg-navy-900 text-white' : 'text-navy-900 hover:bg-grey-100'
              }`}
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </div>

      {tags.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-grey-700">{t(locale, 'blogTagsLabel')}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={localeHref(`/blog/tag/${tag.slug}`, locale)}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  activeTagSlug === tag.slug
                    ? 'border-water-500 bg-water-100 text-water-600'
                    : 'border-grey-200 text-grey-700 hover:border-water-500'
                }`}
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
