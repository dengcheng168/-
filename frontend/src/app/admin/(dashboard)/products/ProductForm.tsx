'use client';

import { useActionState } from 'react';
import { FormField, fieldInputClasses } from '@/components/admin/FormField';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { MultiImageUploader } from '@/components/admin/MultiImageUploader';
import { TranslationMeta } from '@/components/admin/TranslationMeta';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/admin/ui/tabs';
import type { AdminFormState } from '@/lib/actions/admin/categories';
import type { TranslationFormState } from '@/lib/actions/admin/translations-shared';

interface CategoryOption {
  id: number;
  name: string;
}

interface FormValues {
  name?: string;
  sku?: string | null;
  categoryId?: number;
  shortDescription?: string | null;
  description?: string;
  mainImage?: string;
  mainImageMobile?: string | null;
  galleryImages?: { url: string; alt?: string; mobileUrl?: string }[];
  specs?: { label: string; value: string }[];
  features?: (string | { title: string; description?: string })[];
  applications?: { title: string; description?: string }[];
  packagingInfo?: string | null;
  moq?: string | null;
  oemOdmSupport?: boolean;
  specSheetUrl?: string | null;
  status?: string;
  featured?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
}

interface TranslationValues {
  name?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  specs?: { label: string; value: string }[] | null;
  features?: (string | { title: string; description?: string })[] | null;
  applications?: { title: string; description?: string }[] | null;
  packagingInfo?: string | null;
  moq?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  translationStatus?: string;
  updatedAt?: string;
  updatedBy?: number | null;
}

function specsToText(specs?: { label: string; value: string }[] | null) {
  return (specs ?? []).map((s) => `${s.label}: ${s.value}`).join('\n');
}

function featuresToText(features?: (string | { title: string; description?: string })[] | null) {
  return (features ?? []).map((f) => (typeof f === 'string' ? f : f.title)).join('\n');
}

function applicationsToText(apps?: { title: string; description?: string }[] | null) {
  return (apps ?? []).map((a) => (a.description ? `${a.title}: ${a.description}` : a.title)).join('\n');
}

export function ProductForm({
  action,
  categories,
  initialValues,
  translationAction,
  translation,
}: {
  action: (prevState: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  categories: CategoryOption[];
  initialValues?: FormValues;
  translationAction?: (prevState: TranslationFormState, formData: FormData) => Promise<TranslationFormState>;
  translation?: TranslationValues | null;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [esState, esFormAction, esPending] = useActionState(translationAction ?? action, {});

  const englishForm = (
    <form action={formAction} className="max-w-3xl space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="产品名称" htmlFor="name" required>
          <input id="name" name="name" defaultValue={initialValues?.name} required className={fieldInputClasses} />
        </FormField>
        <FormField label="产品编号 SKU" htmlFor="sku">
          <input id="sku" name="sku" defaultValue={initialValues?.sku ?? ''} className={fieldInputClasses} />
        </FormField>
      </div>

      <FormField label="产品分类" htmlFor="categoryId" required>
        <select id="categoryId" name="categoryId" defaultValue={initialValues?.categoryId} required className={fieldInputClasses}>
          <option value="">请选择分类</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="简短描述" htmlFor="shortDescription">
        <input id="shortDescription" name="shortDescription" defaultValue={initialValues?.shortDescription ?? ''} className={fieldInputClasses} />
      </FormField>

      <FormField label="详细描述（HTML）" htmlFor="description" hint="支持 HTML 标签，如 <p> <strong> <ul><li>">
        <textarea id="description" name="description" rows={6} defaultValue={initialValues?.description} className={fieldInputClasses} />
      </FormField>

      <ImageUploader
        name="mainImage"
        label="主图"
        defaultValue={initialValues?.mainImage}
        recommendedSize="标准比例：1:1　推荐尺寸：1200×1200px　最低建议：1000×1000px。请使用清晰的产品图片，上传后系统会自动裁剪为标准画布，前台会根据电脑、平板和手机屏幕自动缩放，不会把页面撑宽。若是产品实拍照：建议干净背景、主体居中，四周留出适当空间，不要把产品贴到图片边缘。带文字的宣传/参数信息图也可以上传（前台完整缩放显示、不裁切，支持点击查看大图）"
        aspectRatio={1}
        minRecommendedSize={1000}
      />
      <ImageUploader
        name="mainImageMobile"
        label="主图 - 手机端专用版本（可选）"
        defaultValue={initialValues?.mainImageMobile ?? ''}
        recommendedSize="一般不需要单独上传——手机端前台已经会把上方主图完整缩放显示，并支持点击放大查看清晰原图。只有极少数情况（希望手机端展示跟桌面完全不同的一张图）才需要用到这里。留空则手机端自动显示与桌面端相同的主图"
      />
      <MultiImageUploader
        name="galleryImages"
        label="详情图片（多张）"
        defaultValue={initialValues?.galleryImages}
        recommendedSize="标准比例：1:1　推荐尺寸：1200×1200px　最低建议：1000×1000px，可上传多张。适合上传产品不同角度、应用场景、安装方式、配件、卖点、参数信息图等。含文字的信息图也建议尽量按 1:1 设计；前台手机端会完整缩放显示，不会裁掉左右内容，也支持点击查看大图"
        aspectRatio={1}
        minRecommendedSize={1000}
        mobileVariantHint="一般不需要——手机端前台已支持点击放大查看清晰原图。只有极少数图片需要跟桌面端完全不同的手机版内容时，才需要点「手机版」单独上传"
      />

      <FormField label="参数表" htmlFor="specsText" hint="每行一条，格式：标签: 值，例如 Daily Output: 50 GPD">
        <textarea id="specsText" name="specsText" rows={4} defaultValue={specsToText(initialValues?.specs)} className={fieldInputClasses} />
      </FormField>

      <FormField label="产品特点" htmlFor="featuresText" hint="每行一条">
        <textarea id="featuresText" name="featuresText" rows={4} defaultValue={featuresToText(initialValues?.features)} className={fieldInputClasses} />
      </FormField>

      <FormField label="应用场景" htmlFor="applicationsText" hint="每行一条，格式：标题: 描述">
        <textarea
          id="applicationsText"
          name="applicationsText"
          rows={4}
          defaultValue={applicationsToText(initialValues?.applications)}
          className={fieldInputClasses}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="包装信息" htmlFor="packagingInfo">
          <input id="packagingInfo" name="packagingInfo" defaultValue={initialValues?.packagingInfo ?? ''} className={fieldInputClasses} />
        </FormField>
        <FormField label="最小起订量 MOQ" htmlFor="moq">
          <input id="moq" name="moq" defaultValue={initialValues?.moq ?? ''} className={fieldInputClasses} />
        </FormField>
      </div>

      <FormField label="PDF 规格书地址（可选）" htmlFor="specSheetUrl">
        <input id="specSheetUrl" name="specSheetUrl" defaultValue={initialValues?.specSheetUrl ?? ''} className={fieldInputClasses} />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="上架状态" htmlFor="status">
          <select id="status" name="status" defaultValue={initialValues?.status ?? 'DRAFT'} className={fieldInputClasses}>
            <option value="DRAFT">草稿</option>
            <option value="PUBLISHED">已发布</option>
          </select>
        </FormField>
        <div className="flex items-end gap-6 pb-2">
          <label className="flex items-center gap-2 text-sm text-navy-950">
            <input type="checkbox" name="featured" defaultChecked={initialValues?.featured} /> 首页推荐
          </label>
          <label className="flex items-center gap-2 text-sm text-navy-950">
            <input type="checkbox" name="oemOdmSupport" defaultChecked={initialValues?.oemOdmSupport ?? true} /> 支持 OEM/ODM
          </label>
        </div>
      </div>

      <FormField label="SEO 标题" htmlFor="seoTitle">
        <input id="seoTitle" name="seoTitle" defaultValue={initialValues?.seoTitle ?? ''} className={fieldInputClasses} />
      </FormField>
      <FormField label="SEO 描述" htmlFor="seoDescription">
        <textarea id="seoDescription" name="seoDescription" rows={2} defaultValue={initialValues?.seoDescription ?? ''} className={fieldInputClasses} />
      </FormField>
      <FormField label="SEO 关键词" htmlFor="seoKeywords">
        <input id="seoKeywords" name="seoKeywords" defaultValue={initialValues?.seoKeywords ?? ''} className={fieldInputClasses} />
      </FormField>

      {state.message && <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>{state.message}</p>}

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
        <form action={esFormAction} className="max-w-3xl space-y-4">
          <TranslationMeta
            translationStatus={translation?.translationStatus}
            updatedAt={translation?.updatedAt}
            updatedBy={translation?.updatedBy}
          />

          <FormField label="产品名称（西班牙语）" htmlFor="es_name" hint={`英文原文：${initialValues?.name ?? ''}`}>
            <input id="es_name" name="name" defaultValue={translation?.name ?? ''} className={fieldInputClasses} />
          </FormField>

          <FormField
            label="简短描述（西班牙语）"
            htmlFor="es_shortDescription"
            hint={`英文原文：${initialValues?.shortDescription ?? ''}`}
          >
            <input id="es_shortDescription" name="shortDescription" defaultValue={translation?.shortDescription ?? ''} className={fieldInputClasses} />
          </FormField>

          <FormField label="详细描述（西班牙语 HTML）" htmlFor="es_description" hint="支持 HTML 标签；留空则前台自动显示英文原文">
            <textarea id="es_description" name="description" rows={6} defaultValue={translation?.description ?? ''} className={fieldInputClasses} />
          </FormField>
          {initialValues?.description && (
            <details className="rounded-md border border-border bg-muted/30 p-3 text-sm">
              <summary className="cursor-pointer font-medium text-muted-foreground">查看英文原文（详细描述）</summary>
              <div className="prose prose-sm mt-2 max-w-none" dangerouslySetInnerHTML={{ __html: initialValues.description }} />
            </details>
          )}

          <FormField label="参数表（西班牙语，仅译 label）" htmlFor="es_specsText" hint={`每行一条，格式：标签: 值。英文原文：\n${specsToText(initialValues?.specs)}`}>
            <textarea id="es_specsText" name="specsText" rows={4} defaultValue={specsToText(translation?.specs)} className={fieldInputClasses} />
          </FormField>

          <FormField label="产品特点（西班牙语）" htmlFor="es_featuresText" hint={`每行一条。英文原文：\n${featuresToText(initialValues?.features)}`}>
            <textarea id="es_featuresText" name="featuresText" rows={4} defaultValue={featuresToText(translation?.features)} className={fieldInputClasses} />
          </FormField>

          <FormField
            label="应用场景（西班牙语）"
            htmlFor="es_applicationsText"
            hint={`每行一条，格式：标题: 描述。英文原文：\n${applicationsToText(initialValues?.applications)}`}
          >
            <textarea
              id="es_applicationsText"
              name="applicationsText"
              rows={4}
              defaultValue={applicationsToText(translation?.applications)}
              className={fieldInputClasses}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="包装信息（西班牙语）" htmlFor="es_packagingInfo" hint={`英文原文：${initialValues?.packagingInfo ?? ''}`}>
              <input id="es_packagingInfo" name="packagingInfo" defaultValue={translation?.packagingInfo ?? ''} className={fieldInputClasses} />
            </FormField>
            <FormField label="MOQ（西班牙语）" htmlFor="es_moq" hint={`英文原文：${initialValues?.moq ?? ''}`}>
              <input id="es_moq" name="moq" defaultValue={translation?.moq ?? ''} className={fieldInputClasses} />
            </FormField>
          </div>

          <FormField label="SEO 标题（西班牙语）" htmlFor="es_seoTitle" hint={`英文原文：${initialValues?.seoTitle ?? ''}`}>
            <input id="es_seoTitle" name="seoTitle" defaultValue={translation?.seoTitle ?? ''} className={fieldInputClasses} />
          </FormField>
          <FormField label="SEO 描述（西班牙语）" htmlFor="es_seoDescription" hint={`英文原文：${initialValues?.seoDescription ?? ''}`}>
            <textarea id="es_seoDescription" name="seoDescription" rows={2} defaultValue={translation?.seoDescription ?? ''} className={fieldInputClasses} />
          </FormField>
          <FormField label="SEO 关键词（西班牙语）" htmlFor="es_seoKeywords">
            <input id="es_seoKeywords" name="seoKeywords" defaultValue={translation?.seoKeywords ?? ''} className={fieldInputClasses} />
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
