'use client';

import { useActionState } from 'react';
import { FormField, fieldInputClasses } from '@/components/admin/FormField';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { updateHomepageSettingsAction } from '@/lib/actions/admin/settings';

interface Values {
  heroHeadline: string;
  heroSubheadline: string;
  heroButton1Text: string;
  heroButton1Link: string;
  heroButton2Text: string;
  heroButton2Link: string;
  heroDesktopImage: string | null;
  heroMobileImage: string | null;
  coreAdvantages: unknown;
  stats: unknown;
  oemProcessSteps: unknown;
  factoryStats: unknown;
  factoryPhotos: unknown;
  partnerRegions: unknown;
}

function toJsonText(value: unknown) {
  return JSON.stringify(value ?? [], null, 2);
}

export function HomepageForm({ initialValues }: { initialValues: Values }) {
  const [state, formAction, pending] = useActionState(updateHomepageSettingsAction, {});

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <section className="space-y-4 rounded-lg border border-grey-200 bg-white p-5">
        <h2 className="font-semibold text-navy-950">首屏 Banner</h2>
        <FormField label="主标题" htmlFor="heroHeadline">
          <input id="heroHeadline" name="heroHeadline" defaultValue={initialValues.heroHeadline} className={fieldInputClasses} />
        </FormField>
        <FormField label="副标题" htmlFor="heroSubheadline">
          <textarea id="heroSubheadline" name="heroSubheadline" rows={2} defaultValue={initialValues.heroSubheadline} className={fieldInputClasses} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="按钮一文字" htmlFor="heroButton1Text">
            <input id="heroButton1Text" name="heroButton1Text" defaultValue={initialValues.heroButton1Text} className={fieldInputClasses} />
          </FormField>
          <FormField label="按钮一链接" htmlFor="heroButton1Link">
            <input id="heroButton1Link" name="heroButton1Link" defaultValue={initialValues.heroButton1Link} className={fieldInputClasses} />
          </FormField>
          <FormField label="按钮二文字" htmlFor="heroButton2Text">
            <input id="heroButton2Text" name="heroButton2Text" defaultValue={initialValues.heroButton2Text} className={fieldInputClasses} />
          </FormField>
          <FormField label="按钮二链接" htmlFor="heroButton2Link">
            <input id="heroButton2Link" name="heroButton2Link" defaultValue={initialValues.heroButton2Link} className={fieldInputClasses} />
          </FormField>
        </div>
        <ImageUploader
          name="heroDesktopImage"
          label="桌面端 Banner 图片"
          defaultValue={initialValues.heroDesktopImage}
          recommendedSize="建议 1920×1080px（宽屏横幅）"
          aspectRatio={16 / 9}
        />
        <ImageUploader
          name="heroMobileImage"
          label="移动端 Banner 图片"
          defaultValue={initialValues.heroMobileImage}
          recommendedSize="建议 1080×1350px（竖版）"
          aspectRatio={4 / 5}
        />
      </section>

      <section className="space-y-4 rounded-lg border border-grey-200 bg-white p-5">
        <h2 className="font-semibold text-navy-950">结构化区块（JSON 格式，谨慎编辑）</h2>
        <FormField label="核心优势" htmlFor="coreAdvantagesJson" hint='格式：[{"title":"...","description":"..."}]'>
          <textarea id="coreAdvantagesJson" name="coreAdvantagesJson" rows={4} defaultValue={toJsonText(initialValues.coreAdvantages)} className={`${fieldInputClasses} font-mono text-xs`} />
        </FormField>
        <FormField label="数据统计" htmlFor="statsJson" hint='格式：[{"label":"...","value":"..."}]'>
          <textarea id="statsJson" name="statsJson" rows={4} defaultValue={toJsonText(initialValues.stats)} className={`${fieldInputClasses} font-mono text-xs`} />
        </FormField>
        <FormField label="OEM 流程步骤" htmlFor="oemProcessStepsJson" hint='格式：["步骤一","步骤二",...]'>
          <textarea id="oemProcessStepsJson" name="oemProcessStepsJson" rows={4} defaultValue={toJsonText(initialValues.oemProcessSteps)} className={`${fieldInputClasses} font-mono text-xs`} />
        </FormField>
        <FormField label="工厂数据" htmlFor="factoryStatsJson" hint='格式：[{"label":"...","value":"..."}]'>
          <textarea id="factoryStatsJson" name="factoryStatsJson" rows={4} defaultValue={toJsonText(initialValues.factoryStats)} className={`${fieldInputClasses} font-mono text-xs`} />
        </FormField>
        <FormField label="工厂图片地址" htmlFor="factoryPhotosJson" hint='格式：["/uploads/...","/uploads/..."]，请先在媒体库上传后复制地址'>
          <textarea id="factoryPhotosJson" name="factoryPhotosJson" rows={4} defaultValue={toJsonText(initialValues.factoryPhotos)} className={`${fieldInputClasses} font-mono text-xs`} />
        </FormField>
        <FormField label="全球合作区域" htmlFor="partnerRegionsJson" hint='格式：["North America","Europe",...]'>
          <textarea id="partnerRegionsJson" name="partnerRegionsJson" rows={3} defaultValue={toJsonText(initialValues.partnerRegions)} className={`${fieldInputClasses} font-mono text-xs`} />
        </FormField>
      </section>

      {state.message && <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>{state.message}</p>}
      <button type="submit" disabled={pending} className="rounded-md bg-water-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-water-600 disabled:opacity-60">
        {pending ? '保存中...' : '保存'}
      </button>
    </form>
  );
}
