'use client';

import { useActionState } from 'react';
import { FormField, fieldInputClasses } from '@/components/admin/FormField';
import { updatePixelSettingsAction } from '@/lib/actions/admin/settings';

interface Values {
  metaPixelId: string | null;
  tiktokPixelId: string | null;
  twitterPixelId: string | null;
  googlePixelId: string | null;
}

const PIXEL_FIELDS = [
  { name: 'metaPixelId', label: 'Meta 像素' },
  { name: 'tiktokPixelId', label: 'TikTok 像素' },
  { name: 'twitterPixelId', label: '推特（X）像素' },
  { name: 'googlePixelId', label: 'Google 像素' },
] as const;

export function PixelSettingsForm({ initialValues }: { initialValues: Values }) {
  const [state, formAction, pending] = useActionState(updatePixelSettingsAction, {});

  return (
    <div className="max-w-xl space-y-4">
      <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        当前只保存像素 ID，前台页面还没有接入对应的追踪脚本，填写后不会立即产生任何追踪行为。真正启用
        需要另外确认（涉及用户隐私合规，通常要配合 Cookie 同意管理一起上线）。
      </p>
      <form action={formAction} className="space-y-4">
        {PIXEL_FIELDS.map((field) => (
          <FormField key={field.name} label={field.label} htmlFor={field.name}>
            <input
              id={field.name}
              name={field.name}
              defaultValue={initialValues[field.name] ?? ''}
              placeholder="未填写"
              className={fieldInputClasses}
            />
          </FormField>
        ))}

        {state.message && <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>{state.message}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-water-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-water-600 disabled:opacity-60"
        >
          {pending ? '保存中...' : '保存'}
        </button>
      </form>
    </div>
  );
}
