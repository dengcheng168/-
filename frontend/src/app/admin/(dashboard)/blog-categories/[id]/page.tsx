import { notFound } from 'next/navigation';
import { adminFetch } from '@/lib/api/admin-client';
import { BlogCategoryForm } from '../BlogCategoryForm';
import { updateBlogCategoryAction } from '@/lib/actions/admin/blog-categories';

interface Detail {
  id: number;
  name: string;
  description: string | null;
  published: boolean;
}

export default async function EditBlogCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const result = await adminFetch<Detail>(`/blog-categories/${id}`).catch(() => null);
  if (!result) notFound();
  const category = result.data;

  const boundAction = updateBlogCategoryAction.bind(null, Number(id));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">编辑博客分类</h1>
      <div className="mt-6">
        <BlogCategoryForm action={boundAction} initialValues={category} />
      </div>
    </div>
  );
}
