'use client';

import { useActionState } from 'react';
import { fieldInputClasses } from '@/components/admin/FormField';
import { updateSocialSettingsAction } from '@/lib/actions/admin/settings';
import type { SocialLink } from '@/types/settings';

export function SocialSettingsForm({ initialValues }: { initialValues: SocialLink[] }) {
  const [state, formAction, pending] = useActionState(updateSocialSettingsAction, {});

  return (
    <form action={formAction} className="max-w-2xl space-y-3">
      <div className="overflow-hidden rounded-lg border border-grey-200">
        <div className="grid grid-cols-[110px_1fr_84px] gap-3 border-b border-grey-200 bg-grey-50 px-4 py-2 text-xs font-medium text-grey-500">
          <span>平台</span>
          <span>主页链接</span>
          <span className="text-center">启用</span>
        </div>
        {initialValues.map((item) => (
          <div key={item.platform} className="grid grid-cols-[110px_1fr_84px] items-center gap-3 border-b border-grey-100 px-4 py-3 last:border-b-0">
            <label htmlFor={`url_${item.platform}`} className="text-sm font-medium text-navy-950">
              {item.label}
            </label>
            <input
              id={`url_${item.platform}`}
              name={`url_${item.platform}`}
              type="url"
              placeholder={`https://...`}
              defaultValue={item.url}
              className={fieldInputClasses}
            />
            <label className="flex items-center justify-center gap-2 text-xs text-grey-500">
              <input
                type="checkbox"
                name={`enabled_${item.platform}`}
                defaultChecked={item.enabled}
                className="h-4 w-4 rounded border-grey-300 text-water-500 focus:ring-water-500"
              />
              显示
            </label>
          </div>
        ))}
      </div>

      {state.message && <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>{state.message}</p>}
      <button type="submit" disabled={pending} className="rounded-md bg-water-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-water-600 disabled:opacity-60">
        {pending ? '保存中...' : '保存'}
      </button>
    </form>
  );
}
