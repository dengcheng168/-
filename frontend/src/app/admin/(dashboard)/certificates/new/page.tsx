import { CertificateForm } from '../CertificateForm';
import { createCertificateAction } from '@/lib/actions/admin/certificates';

export default function NewCertificatePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">新增证书</h1>
      <div className="mt-6">
        <CertificateForm action={createCertificateAction} />
      </div>
    </div>
  );
}
