import { notFound } from 'next/navigation';
import { adminFetch } from '@/lib/api/admin-client';
import { CategoryForm } from '../CategoryForm';
import { updateCategoryAction } from '@/lib/actions/admin/categories';

interface CategoryDetail {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  published: boolean;
}

export default async function EditProductCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const result = await adminFetch<CategoryDetail>(`/product-categories/${id}`).catch(() => null);
  if (!result) notFound();
  const category = result.data;

  const boundAction = updateCategoryAction.bind(null, Number(id));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">编辑产品分类</h1>
      <div className="mt-6">
        <CategoryForm action={boundAction} initialValues={category} />
      </div>
    </div>
  );
}
