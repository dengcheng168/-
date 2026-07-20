'use client';

import { useActionState } from 'react';
import { FormField, fieldInputClasses } from '@/components/admin/FormField';
import { saveTranslationsAction } from '@/lib/actions/admin/translations';

interface HeroSettings {
  heroHeadline: string;
  heroSubheadline: string;
  heroButton1Text: string;
  heroButton2Text: string;
}

interface NavItem {
  id: number;
  label: string;
}

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

function EsField({ name, label, enValue, translations, multiline }: {
  name: string;
  label: string;
  enValue: string;
  translations: Record<string, string>;
  multiline?: boolean;
}) {
  const defaultValue = translations[name.replace(/^t__/, '')] ?? '';
  return (
    <FormField label={label} htmlFor={name} hint={`英文原文：${enValue}`}>
      {multiline ? (
        <textarea id={name} name={name} rows={3} defaultValue={defaultValue} className={fieldInputClasses} />
      ) : (
        <input id={name} name={name} defaultValue={defaultValue} className={fieldInputClasses} />
      )}
    </FormField>
  );
}

export function TranslationsForm({
  settings,
  navItems,
  faqs,
  translations,
}: {
  settings: HeroSettings;
  navItems: NavItem[];
  faqs: FaqItem[];
  translations: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState(saveTranslationsAction, {});

  return (
    <form action={formAction} className="max-w-3xl space-y-10">
      <section className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground">首页 Hero 文案</h2>
        <EsField name="t__settings.heroHeadline" label="主标题" enValue={settings.heroHeadline} translations={translations} />
        <EsField name="t__settings.heroSubheadline" label="副标题" enValue={settings.heroSubheadline} translations={translations} multiline />
        <EsField name="t__settings.heroButton1Text" label="按钮一文字" enValue={settings.heroButton1Text} translations={translations} />
        <EsField name="t__settings.heroButton2Text" label="按钮二文字" enValue={settings.heroButton2Text} translations={translations} />
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground">导航菜单</h2>
        {navItems.length === 0 && <p className="text-sm text-muted-foreground">暂无导航项。</p>}
        {navItems.map((item) => (
          <EsField
            key={item.id}
            name={`t__nav.${item.id}.label`}
            label={`菜单项 #${item.id}`}
            enValue={item.label}
            translations={translations}
          />
        ))}
      </section>

      <section className="space-y-6 rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground">FAQ 问答</h2>
        {faqs.length === 0 && <p className="text-sm text-muted-foreground">暂无 FAQ。</p>}
        {faqs.map((faq) => (
          <div key={faq.id} className="space-y-3 border-t border-border pt-4 first:border-none first:pt-0">
            <EsField
              name={`t__faq.${faq.id}.question`}
              label={`问题 #${faq.id}`}
              enValue={faq.question}
              translations={translations}
            />
            <EsField
              name={`t__faq.${faq.id}.answer`}
              label={`答案 #${faq.id}`}
              enValue={faq.answer}
              translations={translations}
              multiline
            />
          </div>
        ))}
      </section>

      {state.message && (
        <p className={`text-sm ${state.success ? 'text-green-600' : 'text-destructive'}`}>{state.message}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-water-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-water-600 disabled:opacity-60"
      >
        {pending ? '保存中...' : '保存全部译文'}
      </button>
    </form>
  );
}
