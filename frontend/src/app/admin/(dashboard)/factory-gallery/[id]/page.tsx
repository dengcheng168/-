import { notFound } from 'next/navigation';
import { adminFetch } from '@/lib/api/admin-client';
import { FactoryGalleryItemForm } from '../FactoryGalleryItemForm';
import { updateFactoryGalleryItemAction, updateFactoryGalleryItemTranslationAction } from '@/lib/actions/admin/factory-gallery';
import { fetchTranslation } from '@/lib/actions/admin/translations-shared';

interface Detail {
  id: number;
  title: string;
  imageUrl: string | null;
  description: string | null;
  published: boolean;
}

export default async function EditFactoryGalleryItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const result = await adminFetch<Detail>(`/factory-gallery/${id}`).catch(() => null);
  if (!result) notFound();
  const item = result.data;

  const boundAction = updateFactoryGalleryItemAction.bind(null, Number(id));
  const boundTranslationAction = updateFactoryGalleryItemTranslationAction.bind(null, Number(id), 'es');
  const translation = await fetchTranslation<{ title: string | null; description: string | null }>(
    `/factory-gallery/${id}/translations/es`,
  ).catch(() => null);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">编辑展示图</h1>
      <div className="mt-6">
        <FactoryGalleryItemForm
          action={boundAction}
          initialValues={item}
          translationAction={boundTranslationAction}
          translation={translation}
        />
      </div>
    </div>
  );
}
