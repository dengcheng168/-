import { notFound } from 'next/navigation';
import { adminFetch } from '@/lib/api/admin-client';
import { CertificateForm } from '../CertificateForm';
import { updateCertificateAction, updateCertificateTranslationAction } from '@/lib/actions/admin/certificates';
import { fetchTranslation } from '@/lib/actions/admin/translations-shared';

interface Detail {
  id: number;
  name: string;
  certType: string | null;
  certNumber: string | null;
  issuingAuthority: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  imageUrl: string;
  pdfUrl: string | null;
  description: string | null;
  published: boolean;
}

export default async function EditCertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const result = await adminFetch<Detail>(`/certificates/${id}`).catch(() => null);
  if (!result) notFound();
  const cert = result.data;

  const boundAction = updateCertificateAction.bind(null, Number(id));
  const boundTranslationAction = updateCertificateTranslationAction.bind(null, Number(id), 'es');
  const translation = await fetchTranslation<{ name: string | null; description: string | null }>(
    `/certificates/${id}/translations/es`,
  ).catch(() => null);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">编辑证书</h1>
      <div className="mt-6">
        <CertificateForm
          action={boundAction}
          initialValues={cert}
          translationAction={boundTranslationAction}
          translation={translation}
        />
      </div>
    </div>
  );
}
