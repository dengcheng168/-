'use client';

import { useActionState } from 'react';
import { FormField, fieldInputClasses } from '@/components/admin/FormField';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { updateSeoSettingsAction } from '@/lib/actions/admin/settings';

interface Values {
  defaultSeoTitle: string | null;
  defaultSeoDescription: string | null;
  defaultOgImage: string | null;
}

export function SeoSettingsForm({ initialValues }: { initialValues: Values }) {
  const [state, formAction, pending] = useActionState(updateSeoSettingsAction, {});

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <FormField label="默认 SEO 标题" htmlFor="defaultSeoTitle">
        <input id="defaultSeoTitle" name="defaultSeoTitle" defaultValue={initialValues.defaultSeoTitle ?? ''} className={fieldInputClasses} />
      </FormField>
      <FormField label="默认 SEO 描述" htmlFor="defaultSeoDescription">
        <textarea id="defaultSeoDescription" name="defaultSeoDescription" rows={3} defaultValue={initialValues.defaultSeoDescription ?? ''} className={fieldInputClasses} />
      </FormField>
      <ImageUploader
        name="defaultOgImage"
        label="默认 Open Graph 图片"
        defaultValue={initialValues.defaultOgImage}
        recommendedSize="建议 1200×630px（Open Graph 标准尺寸）"
        aspectRatio={1200 / 630}
      />

      {state.message && <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>{state.message}</p>}
      <button type="submit" disabled={pending} className="rounded-md bg-water-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-water-600 disabled:opacity-60">
        {pending ? '保存中...' : '保存'}
      </button>
    </form>
  );
}
