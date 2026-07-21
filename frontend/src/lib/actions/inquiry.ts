'use server';

import { apiFetch, ApiError } from '@/lib/api/client';
import { t } from '@/lib/i18n/site-strings';
import { isSupportedLocale } from '@/lib/i18n/locales';
import type { Locale } from '@/lib/i18n/locales';

export interface InquiryFormState {
  success?: boolean;
  message?: string;
}

export async function submitInquiryAction(
  _prevState: InquiryFormState,
  formData: FormData,
): Promise<InquiryFormState> {
  const value = (key: string) => {
    const v = formData.get(key);
    return typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined;
  };

  const rawLocale = value('locale');
  const locale: Locale = rawLocale && isSupportedLocale(rawLocale) ? rawLocale : 'en';

  const payload = {
    name: value('name'),
    company: value('company'),
    country: value('country'),
    email: value('email'),
    phone: value('phone'),
    whatsapp: value('whatsapp'),
    productName: value('productName'),
    quantity: value('quantity'),
    message: value('message'),
    sourcePage: value('sourcePage'),
    // 蜜罐字段：正常用户看不到，机器人脚本常会自动填写
    website: value('website'),
  };

  if (!payload.name || !payload.email) {
    return { success: false, message: t(locale, 'formRequiredError') };
  }

  try {
    await apiFetch('/inquiries', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { success: true, message: t(locale, 'formSuccessMessage') };
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: t(locale, 'formGenericError') };
  }
}
