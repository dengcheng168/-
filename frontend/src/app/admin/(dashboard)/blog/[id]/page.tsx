import { notFound } from 'next/navigation';
import { adminFetch } from '@/lib/api/admin-client';
import { BlogPostForm } from '../BlogPostForm';
import { updateBlogPostAction, updateBlogPostTranslationAction } from '@/lib/actions/admin/blog';
import { fetchTranslation } from '@/lib/actions/admin/translations-shared';

interface PostDetail {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  coverImage: string | null;
  categoryId: number;
  authorName: string;
  status: string;
  seoTitle: string | null;
  seoDescription: string | null;
  tags: { id: number; name: string }[];
}

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [{ data: categories }, { data: tags }, postResult] = await Promise.all([
    adminFetch<{ id: number; name: string }[]>('/blog-categories?pageSize=100'),
    adminFetch<{ id: number; name: string }[]>('/blog-tags'),
    adminFetch<PostDetail>(`/blog/${id}`).catch(() => null),
  ]);

  if (!postResult) notFound();
  const post = postResult.data;

  const boundAction = updateBlogPostAction.bind(null, Number(id));
  const boundTranslationAction = updateBlogPostTranslationAction.bind(null, Number(id), 'es', post.slug);
  const translation = await fetchTranslation<{
    title: string | null;
    excerpt: string | null;
    body: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
  }>(`/blog/${id}/translations/es`).catch(() => null);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">编辑博客文章</h1>
      <div className="mt-6">
        <BlogPostForm
          action={boundAction}
          categories={categories}
          tags={tags}
          initialValues={post}
          translationAction={boundTranslationAction}
          translation={translation}
        />
      </div>
    </div>
  );
}
