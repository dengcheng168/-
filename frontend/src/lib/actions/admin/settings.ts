'use server';

import { revalidatePath } from 'next/cache';
import { adminFetch } from '@/lib/api/admin-client';
import { ApiError } from '@/lib/api/client';
import { SOCIAL_PLATFORMS } from '@/lib/constants/social-platforms';
import type { AdminFormState } from './categories';

function textOrUndefined(formData: FormData, key: string): string | undefined {
  const v = formData.get(key);
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined;
}

async function patchSettings(
  section: string,
  body: Record<string, unknown>,
  adminPagePath: string = `/admin/settings/${section}`,
): Promise<AdminFormState> {
  try {
    await adminFetch(`/settings/${section}`, { method: 'PATCH', body: JSON.stringify(body) });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '保存失败' };
  }
  revalidatePath(adminPagePath);
  revalidatePath('/', 'layout'); // 首页/页脚等公开页面依赖这些设置，一并刷新
  return { success: true, message: '已保存' };
}

export async function updateSeoSettingsAction(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  return patchSettings('seo', {
    defaultSeoTitle: textOrUndefined(formData, 'defaultSeoTitle'),
    defaultSeoDescription: textOrUndefined(formData, 'defaultSeoDescription'),
    defaultOgImage: textOrUndefined(formData, 'defaultOgImage'),
  });
}

export async function updateContactSettingsAction(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  return patchSettings('contact', {
    companyName: textOrUndefined(formData, 'companyName'),
    companyLogoUrl: textOrUndefined(formData, 'companyLogoUrl'),
    // 用 ?? undefined 而不是 textOrUndefined：后者把"移除图片后保存"的空字符串也当成
    // "没填"直接跳过，导致清空操作在后台悄悄失效（数据库里还是旧值）。这里只保留 null
    // （字段整个没提交）才转成 undefined，空字符串会正常传下去清空数据库字段
    faviconUrl: formData.get('faviconUrl') ?? undefined,
    companyAddress: textOrUndefined(formData, 'companyAddress'),
    companyEmail: textOrUndefined(formData, 'companyEmail'),
    companyPhone: textOrUndefined(formData, 'companyPhone'),
  });
}

export async function updateSocialSettingsAction(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const socialLinks = SOCIAL_PLATFORMS.map(({ platform, label }) => ({
    platform,
    label,
    url: textOrUndefined(formData, `url_${platform}`) ?? '',
    enabled: formData.get(`enabled_${platform}`) === 'on',
  }));
  return patchSettings('social', { socialLinks });
}

export async function updateWhatsappSettingsAction(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  return patchSettings('whatsapp', {
    whatsappNumber: textOrUndefined(formData, 'whatsappNumber'),
    whatsappLink: textOrUndefined(formData, 'whatsappLink'),
  });
}

export async function updateSmtpSettingsAction(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const port = textOrUndefined(formData, 'smtpPort');
  return patchSettings('smtp', {
    smtpEnabled: formData.get('smtpEnabled') === 'on',
    smtpHost: textOrUndefined(formData, 'smtpHost'),
    smtpPort: port ? Number(port) : undefined,
    smtpUser: textOrUndefined(formData, 'smtpUser'),
    smtpPassword: textOrUndefined(formData, 'smtpPassword'),
    smtpFromEmail: textOrUndefined(formData, 'smtpFromEmail'),
  });
}

export async function testSmtpAction(): Promise<AdminFormState> {
  try {
    await adminFetch('/settings/smtp/test', { method: 'POST', body: JSON.stringify({}) });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '测试失败' };
  }
  return { success: true, message: 'SMTP 连接测试成功' };
}

export async function updateHomepageSettingsAction(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  function parseJsonField(key: string, fallback: unknown) {
    const raw = textOrUndefined(formData, key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  return patchSettings('homepage', {
    heroHeadline: formData.get('heroHeadline'),
    heroSubheadline: formData.get('heroSubheadline'),
    heroButton1Text: formData.get('heroButton1Text'),
    heroButton1Link: formData.get('heroButton1Link'),
    heroButton2Text: formData.get('heroButton2Text'),
    heroButton2Link: formData.get('heroButton2Link'),
    heroDesktopImage: textOrUndefined(formData, 'heroDesktopImage'),
    heroMobileImage: textOrUndefined(formData, 'heroMobileImage'),
    coreAdvantages: parseJsonField('coreAdvantagesJson', undefined),
    stats: parseJsonField('statsJson', undefined),
    oemProcessSteps: parseJsonField('oemProcessStepsJson', undefined),
    factoryStats: parseJsonField('factoryStatsJson', undefined),
    factoryPhotos: parseJsonField('factoryPhotosJson', undefined),
    partnerRegions: parseJsonField('partnerRegionsJson', undefined),
  }, '/admin/homepage');
}

export async function changePasswordAction(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const newPassword = formData.get('newPassword');
  const confirmPassword = formData.get('confirmPassword');
  if (newPassword !== confirmPassword) {
    return { message: '两次输入的新密码不一致' };
  }

  try {
    await adminFetch('/account/password', {
      method: 'PATCH',
      body: JSON.stringify({
        currentPassword: formData.get('currentPassword'),
        newPassword,
      }),
    });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '修改失败' };
  }
  return { success: true, message: '密码已修改，请妥善保管' };
}

export async function updateFooterSettingsAction(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  return patchSettings('footer', {
    footerText: textOrUndefined(formData, 'footerText'),
    footerCompanyIntro: textOrUndefined(formData, 'footerCompanyIntro'),
  }, '/admin/footer');
}

export async function updatePixelSettingsAction(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  return patchSettings('pixels', {
    metaPixelId: textOrUndefined(formData, 'metaPixelId'),
    tiktokPixelId: textOrUndefined(formData, 'tiktokPixelId'),
    googlePixelId: textOrUndefined(formData, 'googlePixelId'),
  });
}
