import Link from 'next/link';
import { adminFetch } from '@/lib/api/admin-client';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/admin/ui/button';
import { IconPlus } from '@/components/admin/icons';
import { ProductListClient, type ProductRow } from './ProductListClient';

export default async function AdminProductsPage() {
  const { data, meta } = await adminFetch<ProductRow[]>('/products?pageSize=100');

  return (
    <div>
      <PageHeader
        title="产品列表"
        description="管理产品信息、图片与发布状态。"
        action={
          <Button asChild>
            <Link href="/admin/products/new">
              <IconPlus className="h-4 w-4" />
              新增产品
            </Link>
          </Button>
        }
      />

      <ProductListClient rows={data} total={meta?.total ?? data.length} />
    </div>
  );
}
