import { notFound } from 'next/navigation';
import { adminFetch } from '@/lib/api/admin-client';
import { FaqForm } from '../FaqForm';
import { updateFaqAction, updateFaqTranslationAction } from '@/lib/actions/admin/faqs';
import { fetchTranslation } from '@/lib/actions/admin/translations-shared';

interface Detail {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  published: boolean;
}

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const result = await adminFetch<Detail>(`/faqs/${id}`).catch(() => null);
  if (!result) notFound();
  const faq = result.data;

  const boundAction = updateFaqAction.bind(null, Number(id));
  const boundTranslationAction = updateFaqTranslationAction.bind(null, Number(id), 'es');
  const translation = await fetchTranslation<{ question: string | null; answer: string | null }>(
    `/faqs/${id}/translations/es`,
  ).catch(() => null);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">编辑 FAQ</h1>
      <div className="mt-6">
        <FaqForm
          action={boundAction}
          initialValues={faq}
          translationAction={boundTranslationAction}
          translation={translation}
        />
      </div>
    </div>
  );
}
