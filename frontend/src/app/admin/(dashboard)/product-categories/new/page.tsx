import { CategoryForm } from '../CategoryForm';
import { createCategoryAction } from '@/lib/actions/admin/categories';

export default function NewProductCategoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">新增产品分类</h1>
      <div className="mt-6">
        <CategoryForm action={createCategoryAction} />
      </div>
    </div>
  );
}
