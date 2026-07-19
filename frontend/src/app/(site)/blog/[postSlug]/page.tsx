import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BlogTOC } from '@/components/blog/BlogTOC';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { JsonLd } from '@/components/seo/JsonLd';
import { getBlogPostBySlug } from '@/lib/api/blog';
import { articleJsonLd, breadcrumbListJsonLd } from '@/lib/seo/jsonld';
import { extractHeadingsAndInjectIds } from '@/lib/utils/toc';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ postSlug: string }>;
}): Promise<Metadata> {
  const { postSlug } = await params;
  const result = await getBlogPostBySlug(postSlug);
  if (!result) return {};

  const { post } = result;
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    alternates: { canonical: `/blog/${postSlug}` },
    openGraph: { images: post.coverImage ? [post.coverImage] : undefined },
  };
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ postSlug: string }>;
}) {
  const { postSlug } = await params;
  const result = await getBlogPostBySlug(postSlug);
  if (!result) notFound();

  const { post, related } = result;
  const { html, headings } = extractHeadingsAndInjectIds(post.body);

  return (
    <Container className="py-12">
      <JsonLd data={articleJsonLd(post)} />
      <JsonLd
        data={breadcrumbListJsonLd([
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: post.title, href: `/blog/${post.slug}` },
        ])}
      />

      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }, { label: post.title }]} />

      <article className="mt-6 grid gap-10 lg:grid-cols-[1fr_260px]">
        <div>
          {post.category && (
            <Link href={`/blog/category/${post.category.slug}`} className="text-sm font-medium text-water-600">
              {post.category.name}
            </Link>
          )}
          <h1 className="mt-2 text-3xl font-semibold text-navy-950">{post.title}</h1>
          <p className="mt-2 text-sm text-grey-500">
            By {post.authorName} · {formatDate(post.publishedAt)}
          </p>

          {post.coverImage && (
            <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-lg bg-grey-50">
              <Image src={post.coverImage} alt={post.title} fill sizes="(min-width: 1024px) 66vw, 100vw" className="object-cover" />
            </div>
          )}

          <div
            className="prose prose-sm mt-8 max-w-none text-grey-700"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {post.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/blog/tag/${tag.slug}`}
                  className="rounded-full border border-grey-200 px-3 py-1 text-xs font-medium text-grey-700 hover:border-water-500"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-24">
            <BlogTOC headings={headings} />
          </div>
        </div>
      </article>

      <RelatedPosts posts={related} />
    </Container>
  );
}
