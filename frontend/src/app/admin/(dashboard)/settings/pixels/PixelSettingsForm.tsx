'use client';

import { useActionState, useState } from 'react';
import { FormField, fieldInputClasses } from '@/components/admin/FormField';
import { Badge } from '@/components/admin/ui/badge';
import { updatePixelSettingsAction } from '@/lib/actions/admin/settings';

interface Values {
  metaPixelId: string | null;
  tiktokPixelId: string | null;
  googlePixelId: string | null;
}

const PIXEL_FIELDS = [
  { name: 'metaPixelId', label: 'Meta 像素' },
  { name: 'tiktokPixelId', label: 'TikTok 像素' },
  { name: 'googlePixelId', label: 'Google 像素' },
] as const satisfies { name: keyof Values; label: string }[];

export function PixelSettingsForm({ initialValues }: { initialValues: Values }) {
  const [state, formAction, pending] = useActionState(updatePixelSettingsAction, {});
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(PIXEL_FIELDS.map((field) => [field.name, initialValues[field.name] ?? ''])),
  );

  return (
    <div className="max-w-xl space-y-4">
      <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        Meta / TikTok / Google 三个像素填写并保存后会立即在前台所有页面生效（真实注入追踪脚本），不是仅
        保存不生效。本项目目前没有 Cookie 同意管理，脚本会对所有访客无条件加载，请确认符合你所在地区的
        隐私法规要求（如 GDPR）后再启用。
      </p>
      <form action={formAction} className="space-y-4">
        {PIXEL_FIELDS.map((field) => {
          const connected = values[field.name].trim() !== '';
          return (
            <FormField
              key={field.name}
              htmlFor={field.name}
              label={
                <span className="inline-flex items-center gap-2">
                  {field.label}
                  <Badge variant={connected ? 'success' : 'muted'}>{connected ? '已接入' : '未接入'}</Badge>
                </span>
              }
            >
              <input
                id={field.name}
                name={field.name}
                value={values[field.name]}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
                placeholder="未填写"
                className={fieldInputClasses}
              />
            </FormField>
          );
        })}

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
