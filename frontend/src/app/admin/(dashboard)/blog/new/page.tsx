import { adminFetch } from '@/lib/api/admin-client';
import { BlogPostForm } from '../BlogPostForm';
import { createBlogPostAction } from '@/lib/actions/admin/blog';

export default async function NewBlogPostPage() {
  const [{ data: categories }, { data: tags }] = await Promise.all([
    adminFetch<{ id: number; name: string }[]>('/blog-categories?pageSize=100'),
    adminFetch<{ id: number; name: string }[]>('/blog-tags'),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">新增博客文章</h1>
      <div className="mt-6">
        <BlogPostForm action={createBlogPostAction} categories={categories} tags={tags} />
      </div>
    </div>
  );
}
