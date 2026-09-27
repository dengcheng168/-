'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { adminFetch } from '@/lib/api/admin-client';
import { ApiError } from '@/lib/api/client';
import { SOCIAL_PLATFORMS } from '@/lib/constants/social-platforms';
import type { AdminFormState } from './categories';
import { textOrUndefined } from './form-utils';
import { parseCoreAdvantages } from '@/lib/admin/core-advantages';

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
    googleSiteVerification: textOrUndefined(formData, 'googleSiteVerification'),
  });
}

export async function updateContactSettingsAction(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  return patchSettings('contact', {
    companyName: textOrUndefined(formData, 'companyName'),
    brandName: textOrUndefined(formData, 'brandName'),
    companyLogoUrl: textOrUndefined(formData, 'companyLogoUrl'),
    faviconUrl: textOrUndefined(formData, 'faviconUrl'),
    companyAddress: textOrUndefined(formData, 'companyAddress'),
    companyMapImage: textOrUndefined(formData, 'companyMapImage'),
    companyMapMobileImage: textOrUndefined(formData, 'companyMapMobileImage'),
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
  let coreAdvantages;
  try {
    const raw = textOrUndefined(formData, 'coreAdvantagesJson');
    coreAdvantages = raw === undefined ? undefined : parseCoreAdvantages(raw);
  } catch (err) {
    return { message: err instanceof Error ? err.message : '核心优势内容有误，未保存任何改动。' };
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
    homepageVideoUrl: textOrUndefined(formData, 'homepageVideoUrl'),
    coreAdvantages,
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
    googleAdsId: textOrUndefined(formData, 'googleAdsId'),
  });
}

export async function updateGa4SettingsAction(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  return patchSettings('ga4', {
    googlePixelId: textOrUndefined(formData, 'googlePixelId'),
  }, '/admin/settings/pixels');
}

export async function updateGoogleAdsSettingsAction(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  return patchSettings('google-ads', {
    googleAdsId: textOrUndefined(formData, 'googleAdsId'),
  }, '/admin/settings/pixels');
}

/**
 * 独立于上面的 patchSettings 帮助函数：PATCH /settings/site-domain 只有 SUPER_ADMIN 能调用
 * （后端会真实返回 403，这里不额外做权限判断），成功时后端已经尝试触发前端缓存刷新，
 * 返回体里的 cacheRefreshWarning 字段要单独展示，不能和"保存失败"混为一谈——
 * 域名本身已经写入数据库，只是缓存刷新这一步可能失败，需要提示"可手动重试"而不是"保存失败"。
 */
export async function updateSiteBaseUrlAction(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const raw = formData.get('siteBaseUrl');
  const siteBaseUrl = typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : null;

  try {
    const { data } = await adminFetch<{ cacheRefreshed: boolean; cacheRefreshWarning?: string }>('/settings/site-domain', {
      method: 'PATCH',
      body: JSON.stringify({ siteBaseUrl }),
    });
    revalidatePath('/admin/settings/seo');
    revalidatePath('/', 'layout');
    updateTag('site-config');

    if (!data.cacheRefreshed) {
      return {
        success: true,
        message: `域名已保存，但前端缓存刷新失败（${data.cacheRefreshWarning ?? '未知原因'}），可稍后手动重试或重新保存一次`,
      };
    }
    return { success: true, message: '已保存，全站 SEO 缓存已刷新' };
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '保存失败' };
  }
}
