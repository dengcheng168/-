import { SectionHeading } from '@/components/ui/SectionHeading';
import { BlogCard } from './BlogCard';
import type { BlogPost } from '@/types/blog';
import type { Locale } from '@/lib/i18n/locales';
import { t } from '@/lib/i18n/site-strings';

export function RelatedPosts({ posts, locale = 'en' }: { posts: BlogPost[]; locale?: Locale }) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16">
      <SectionHeading title={t(locale, 'relatedArticles')} align="left" />
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} locale={locale} />
        ))}
      </div>
    </section>
  );
}
