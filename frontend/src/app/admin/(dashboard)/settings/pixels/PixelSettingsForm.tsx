'use client';

import { useActionState, useState } from 'react';
import { FormField, fieldInputClasses } from '@/components/admin/FormField';
import { Badge } from '@/components/admin/ui/badge';
import { updatePixelSettingsAction, updateGa4SettingsAction, updateGoogleAdsSettingsAction } from '@/lib/actions/admin/settings';
import { isGoogleTagId } from '@/lib/analytics/google-tags';

interface Values {
  metaPixelId: string | null;
  tiktokPixelId: string | null;
  googlePixelId: string | null;
  googleAdsId: string | null;
}

const PIXEL_FIELDS = [
  { name: 'metaPixelId', label: 'Meta 像素' },
  { name: 'tiktokPixelId', label: 'TikTok 像素' },
  { name: 'googlePixelId', label: 'Google Analytics 4（GA4）衡量 ID' },
  { name: 'googleAdsId', label: 'Google Ads ID' },
] as const satisfies { name: keyof Values; label: string }[];

export function PixelSettingsForm({ initialValues }: { initialValues: Values }) {
  return (
    <div className="max-w-xl space-y-4">
      <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        仅填写 ID，不要粘贴 &lt;script&gt; 代码。GA4 和 Google Ads 可以同时配置；Google Ads
        此处只安装基础标签，不代表已设置询盘或购买转化。保存后会在前台加载追踪脚本。
        当前没有 Cookie 同意管理，启用前请确认访客隐私与同意要求。
      </p>
      <PixelForm initialValues={initialValues} fields={PIXEL_FIELDS.slice(0, 2)} action={updatePixelSettingsAction} title="Meta / TikTok" />
      <PixelForm initialValues={initialValues} fields={[PIXEL_FIELDS[2]]} action={updateGa4SettingsAction} title="GA4" />
      <PixelForm initialValues={initialValues} fields={[PIXEL_FIELDS[3]]} action={updateGoogleAdsSettingsAction} title="Google Ads" />
      <p className="text-sm text-muted-foreground">
        “已配置”仅表示已保存 ID；实际接收状态请在 GA4 实时报告或 Google Ads 标签诊断中确认。
      </p>
    </div>
  );
}

function PixelForm({ initialValues, fields, action, title }: {
  initialValues: Values;
  fields: readonly (typeof PIXEL_FIELDS)[number][];
  action: typeof updatePixelSettingsAction;
  title: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((field) => [field.name, initialValues[field.name] ?? ''])),
  );
  return (
      <form action={formAction} className="space-y-4">
        {fields.map((field) => {
          const value = values[field.name].trim();
          const kind = field.name === 'googlePixelId' ? 'ga4' : field.name === 'googleAdsId' ? 'ads' : null;
          const valid = !value || !kind || isGoogleTagId(value, kind);
          const changed = value !== (initialValues[field.name] ?? '').trim();
          const status = !value ? (changed ? '待清空保存' : '未配置')
            : !valid ? '格式错误' : changed ? '待保存' : '已配置（未验证）';
          return (
            <FormField
              key={field.name}
              htmlFor={field.name}
              error={!valid ? '格式不正确：只填写对应的 ID，不要粘贴脚本代码。' : undefined}
              label={
                <span className="inline-flex items-center gap-2">
                  {field.label}
                  <Badge variant="muted">{status}</Badge>
                </span>
              }
            >
              <input
                id={field.name}
                name={field.name}
                value={values[field.name]}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
                placeholder={kind === 'ga4' ? 'G-XXXXXXXXXX' : kind === 'ads' ? 'AW-123456789' : '未填写'}
                pattern={kind === 'ga4' ? 'G-[A-Z0-9]+' : kind === 'ads' ? 'AW-[0-9]+' : undefined}
                maxLength={kind ? 64 : undefined}
                title={kind ? '只填写 ID，不要粘贴完整代码；留空可停用' : undefined}
                aria-invalid={!valid}
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
          {pending ? '保存中...' : `保存 ${title}`}
        </button>
      </form>
  );
}
