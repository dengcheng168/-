import { FactoryGalleryItemForm } from '../FactoryGalleryItemForm';
import { createFactoryGalleryItemAction } from '@/lib/actions/admin/factory-gallery';

export default function NewFactoryGalleryItemPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">新增展示图</h1>
      <div className="mt-6">
        <FactoryGalleryItemForm action={createFactoryGalleryItemAction} />
      </div>
    </div>
  );
}
