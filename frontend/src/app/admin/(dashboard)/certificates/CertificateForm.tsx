'use client';

import { useActionState } from 'react';
import { FormField, fieldInputClasses } from '@/components/admin/FormField';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { TranslationMeta } from '@/components/admin/TranslationMeta';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/admin/ui/tabs';
import type { AdminFormState } from '@/lib/actions/admin/categories';
import type { TranslationFormState } from '@/lib/actions/admin/translations-shared';

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

interface TranslationValues {
  name?: string | null;
  description?: string | null;
  translationStatus?: string;
  updatedAt?: string;
  updatedBy?: number | null;
}

function toDateInput(value?: string | null) {
  if (!value) return '';
  return value.slice(0, 10);
}

export function CertificateForm({
  action,
  initialValues,
  translationAction,
  translation,
}: {
  action: (prevState: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  initialValues?: FormValues;
  translationAction?: (prevState: TranslationFormState, formData: FormData) => Promise<TranslationFormState>;
  translation?: TranslationValues | null;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [esState, esFormAction, esPending] = useActionState(translationAction ?? action, {});

  const englishForm = (
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

      <ImageUploader
        name="imageUrl"
        label="证书图片"
        defaultValue={initialValues?.imageUrl}
        recommendedSize="建议 800×800px（正方形）"
        aspectRatio={1}
      />

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

  if (!translationAction) return englishForm;

  return (
    <Tabs defaultValue="en">
      <TabsList>
        <TabsTrigger value="en">English</TabsTrigger>
        <TabsTrigger value="es">Español</TabsTrigger>
      </TabsList>
      <TabsContent value="en">{englishForm}</TabsContent>
      <TabsContent value="es">
        <form action={esFormAction} className="max-w-xl space-y-4">
          <TranslationMeta
            translationStatus={translation?.translationStatus}
            updatedAt={translation?.updatedAt}
            updatedBy={translation?.updatedBy}
          />

          <p className="text-xs text-muted-foreground">
            证书类型/编号/发证机构/日期/图片/PDF 为共用字段，不分语言，请在 English 标签页维护。
          </p>

          <FormField label="证书名称（西班牙语）" htmlFor="es_name" hint={`英文原文：${initialValues?.name ?? ''}`}>
            <input id="es_name" name="name" defaultValue={translation?.name ?? ''} className={fieldInputClasses} />
          </FormField>

          <FormField label="描述（西班牙语）" htmlFor="es_description" hint={`英文原文：${initialValues?.description ?? ''}`}>
            <textarea id="es_description" name="description" rows={3} defaultValue={translation?.description ?? ''} className={fieldInputClasses} />
          </FormField>

          <FormField label="翻译发布状态" htmlFor="es_translationStatus">
            <select
              id="es_translationStatus"
              name="translationStatus"
              defaultValue={translation?.translationStatus ?? 'DRAFT'}
              className={fieldInputClasses}
            >
              <option value="DRAFT">草稿（前台不可见）</option>
              <option value="PUBLISHED">已发布（前台可见）</option>
            </select>
          </FormField>

          {esState.message && (
            <p className={`text-sm ${esState.success ? 'text-green-600' : 'text-red-600'}`}>{esState.message}</p>
          )}

          <button
            type="submit"
            disabled={esPending}
            className="rounded-md bg-water-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-water-600 disabled:opacity-60"
          >
            {esPending ? '保存中...' : '保存西班牙语'}
          </button>
        </form>
      </TabsContent>
    </Tabs>
  );
}
