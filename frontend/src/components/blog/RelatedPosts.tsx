import { SectionHeading } from '@/components/ui/SectionHeading';
import { BlogCard } from './BlogCard';
import type { BlogPost } from '@/types/blog';

export function RelatedPosts({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16">
      <SectionHeading title="Related Articles" align="left" />
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
