import { notFound } from 'next/navigation';
import { adminFetch } from '@/lib/api/admin-client';
import { CategoryForm } from '../CategoryForm';
import { updateCategoryAction, updateCategoryTranslationAction } from '@/lib/actions/admin/categories';
import { fetchTranslation } from '@/lib/actions/admin/translations-shared';

interface CategoryDetail {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  published: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export default async function EditProductCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const result = await adminFetch<CategoryDetail>(`/product-categories/${id}`).catch(() => null);
  if (!result) notFound();
  const category = result.data;

  const boundAction = updateCategoryAction.bind(null, Number(id));
  const boundTranslationAction = updateCategoryTranslationAction.bind(null, Number(id), 'es');
  const translation = await fetchTranslation<{
    name: string | null;
    description: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
  }>(`/product-categories/${id}/translations/es`).catch(() => null);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">编辑产品分类</h1>
      <div className="mt-6">
        <CategoryForm
          action={boundAction}
          initialValues={category}
          translationAction={boundTranslationAction}
          translation={translation}
        />
      </div>
    </div>
  );
}
