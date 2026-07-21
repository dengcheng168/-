import { notFound } from 'next/navigation';
import { adminFetch } from '@/lib/api/admin-client';
import { PageForm } from '../PageForm';
import { updatePageAction, updatePageTranslationAction } from '@/lib/actions/admin/pages';
import { fetchTranslation } from '@/lib/actions/admin/translations-shared';

interface PageDetail {
  slug: string;
  title: string;
  bodyHtml: string | null;
  sections: unknown;
  seoTitle: string | null;
  seoDescription: string | null;
}

export default async function EditPagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const result = await adminFetch<PageDetail>(`/pages/${slug}`).catch(() => null);
  if (!result) notFound();
  const page = result.data;

  const boundAction = updatePageAction.bind(null, slug);
  const boundTranslationAction = updatePageTranslationAction.bind(null, slug, 'es');
  const translation = await fetchTranslation<{
    title: string | null;
    bodyHtml: string | null;
    sections: unknown;
    seoTitle: string | null;
    seoDescription: string | null;
  }>(`/pages/${slug}/translations/es`).catch(() => null);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">编辑页面：{page.title}</h1>
      <div className="mt-6">
        <PageForm
          action={boundAction}
          initialValues={page}
          translationAction={boundTranslationAction}
          translation={translation}
        />
      </div>
    </div>
  );
}
