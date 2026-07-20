'use client';

import { useActionState } from 'react';
import { FormField, fieldInputClasses } from '@/components/admin/FormField';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { updateContactSettingsAction } from '@/lib/actions/admin/settings';

interface Values {
  companyName: string;
  companyLogoUrl: string | null;
  companyAddress: string | null;
  companyEmail: string | null;
  companyPhone: string | null;
}

export function ContactSettingsForm({ initialValues }: { initialValues: Values }) {
  const [state, formAction, pending] = useActionState(updateContactSettingsAction, {});

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <FormField label="公司名称" htmlFor="companyName">
        <input id="companyName" name="companyName" defaultValue={initialValues.companyName} className={fieldInputClasses} />
      </FormField>
      <ImageUploader
        name="companyLogoUrl"
        label="公司 Logo"
        defaultValue={initialValues.companyLogoUrl}
        recommendedSize="建议宽高比约 4:1（如 400×100px），支持透明背景 PNG 或 SVG，不强制裁剪"
      />
      <FormField label="公司地址" htmlFor="companyAddress">
        <textarea id="companyAddress" name="companyAddress" rows={2} defaultValue={initialValues.companyAddress ?? ''} className={fieldInputClasses} />
      </FormField>
      <FormField label="邮箱" htmlFor="companyEmail">
        <input id="companyEmail" name="companyEmail" type="email" defaultValue={initialValues.companyEmail ?? ''} className={fieldInputClasses} />
      </FormField>
      <FormField label="电话" htmlFor="companyPhone">
        <input id="companyPhone" name="companyPhone" defaultValue={initialValues.companyPhone ?? ''} className={fieldInputClasses} />
      </FormField>

      {state.message && <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>{state.message}</p>}
      <button type="submit" disabled={pending} className="rounded-md bg-water-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-water-600 disabled:opacity-60">
        {pending ? '保存中...' : '保存'}
      </button>
    </form>
  );
}
