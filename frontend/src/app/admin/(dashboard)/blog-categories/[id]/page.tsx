import { notFound } from 'next/navigation';
import { adminFetch } from '@/lib/api/admin-client';
import { BlogCategoryForm } from '../BlogCategoryForm';
import { updateBlogCategoryAction, updateBlogCategoryTranslationAction } from '@/lib/actions/admin/blog-categories';
import { fetchTranslation } from '@/lib/actions/admin/translations-shared';

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
  const boundTranslationAction = updateBlogCategoryTranslationAction.bind(null, Number(id), 'es');
  const translation = await fetchTranslation<{ name: string | null; description: string | null }>(
    `/blog-categories/${id}/translations/es`,
  ).catch(() => null);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">编辑博客分类</h1>
      <div className="mt-6">
        <BlogCategoryForm
          action={boundAction}
          initialValues={category}
          translationAction={boundTranslationAction}
          translation={translation}
        />
      </div>
    </div>
  );
}
