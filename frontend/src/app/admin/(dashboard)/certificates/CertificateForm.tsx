'use client';

import { useActionState } from 'react';
import { FormField, fieldInputClasses } from '@/components/admin/FormField';
import { ImageUploader } from '@/components/admin/ImageUploader';
import type { AdminFormState } from '@/lib/actions/admin/categories';

interface FormValues {
  name?: string;
  certType?: string | null;
  certNumber?: string | null;
  issuingAuthority?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  imageUrl?: string | null;
  pdfUrl?: string | null;
  description?: string | null;
  published?: boolean;
}

function toDateInput(value?: string | null) {
  if (!value) return '';
  return value.slice(0, 10);
}

export function CertificateForm({
  action,
  initialValues,
}: {
  action: (prevState: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  initialValues?: FormValues;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <FormField label="证书名称" htmlFor="name" required>
        <input id="name" name="name" defaultValue={initialValues?.name} required className={fieldInputClasses} />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="证书类型（如 CE / RoHS / ISO）" htmlFor="certType">
          <input id="certType" name="certType" defaultValue={initialValues?.certType ?? ''} className={fieldInputClasses} />
        </FormField>
        <FormField label="证书编号" htmlFor="certNumber">
          <input id="certNumber" name="certNumber" defaultValue={initialValues?.certNumber ?? ''} className={fieldInputClasses} />
        </FormField>
      </div>

      <FormField label="发证机构" htmlFor="issuingAuthority">
        <input id="issuingAuthority" name="issuingAuthority" defaultValue={initialValues?.issuingAuthority ?? ''} className={fieldInputClasses} />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="发证日期" htmlFor="issueDate">
          <input id="issueDate" name="issueDate" type="date" defaultValue={toDateInput(initialValues?.issueDate)} className={fieldInputClasses} />
        </FormField>
        <FormField label="到期日期" htmlFor="expiryDate">
          <input id="expiryDate" name="expiryDate" type="date" defaultValue={toDateInput(initialValues?.expiryDate)} className={fieldInputClasses} />
        </FormField>
      </div>

      <ImageUploader name="imageUrl" label="证书图片" defaultValue={initialValues?.imageUrl} />

      <FormField label="PDF 文件地址（可选）" htmlFor="pdfUrl" hint="可先在媒体库上传后粘贴地址">
        <input id="pdfUrl" name="pdfUrl" defaultValue={initialValues?.pdfUrl ?? ''} className={fieldInputClasses} />
      </FormField>

      <FormField label="描述" htmlFor="description">
        <textarea id="description" name="description" rows={3} defaultValue={initialValues?.description ?? ''} className={fieldInputClasses} />
      </FormField>

      <div className="flex items-center gap-2">
        <input id="published" name="published" type="checkbox" defaultChecked={initialValues?.published ?? true} />
        <label htmlFor="published" className="text-sm text-navy-950">
          发布（前台可见）
        </label>
      </div>

      {state.message && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-water-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-water-600 disabled:opacity-60"
      >
        {pending ? '保存中...' : '保存'}
      </button>
    </form>
  );
}
