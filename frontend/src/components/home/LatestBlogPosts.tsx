import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { BlogCard } from '@/components/blog/BlogCard';
import { Button } from '@/components/ui/Button';
import { t } from '@/lib/i18n/site-strings';
import type { Locale } from '@/lib/i18n/locales';
import type { BlogPost } from '@/types/blog';

export function LatestBlogPosts({ posts, locale = 'en' }: { posts: BlogPost[]; locale?: Locale }) {
  if (posts.length === 0) return null;

  return (
    <section className="py-16">
      <Container>
        <SectionHeading eyebrow={t(locale, 'sectionBlogEyebrow')} title={t(locale, 'sectionBlogTitle')} />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button href="/blog" variant="outline">
            {t(locale, 'viewAllArticles')}
          </Button>
        </div>
      </Container>
    </section>
  );
}
