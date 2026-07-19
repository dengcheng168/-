import { adminFetch } from '@/lib/api/admin-client';
import { ProductForm } from '../ProductForm';
import { createProductAction } from '@/lib/actions/admin/products';

export default async function NewProductPage() {
  const { data: categories } = await adminFetch<{ id: number; name: string }[]>('/product-categories?pageSize=100');

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">新增产品</h1>
      <div className="mt-6">
        <ProductForm action={createProductAction} categories={categories} />
      </div>
    </div>
  );
}
