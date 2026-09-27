import { FactoryGalleryItemForm } from '../FactoryGalleryItemForm';
import { createFactoryGalleryItemAction } from '@/lib/actions/admin/factory-gallery';
import { GALLERY_GROUP_LABEL, GALLERY_GROUP_SEQUENCE, type GalleryGroup } from '@/lib/about/gallery-groups';

export default async function NewFactoryGalleryItemPage({ searchParams }: { searchParams: Promise<{ group?: string }> }) {
  const { group: requestedGroup } = await searchParams;
  const galleryGroup: GalleryGroup = GALLERY_GROUP_SEQUENCE.includes(requestedGroup as GalleryGroup)
    ? (requestedGroup as GalleryGroup)
    : 'manufacturing';

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">新增展示图</h1>
      <p className="mt-2 text-sm text-grey-500">当前分类：{GALLERY_GROUP_LABEL[galleryGroup]}</p>
      <div className="mt-6">
        <FactoryGalleryItemForm action={createFactoryGalleryItemAction} initialValues={{ galleryGroup }} />
      </div>
    </div>
  );
}
