import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { BlogCard } from '@/components/blog/BlogCard';
import { Button } from '@/components/ui/Button';
import type { BlogPost } from '@/types/blog';

export function LatestBlogPosts({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="py-16">
      <Container>
        <SectionHeading eyebrow="Insights" title="Latest from the Blog" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button href="/blog" variant="outline">
            View All Articles
          </Button>
        </div>
      </Container>
    </section>
  );
}
