/**
 * 后台"社交媒体设置"里固定展示的平台列表。要新增平台：这里加一项 + Footer 的图标组件里加一个 case。
 */
export const SOCIAL_PLATFORMS = [
  { platform: 'facebook', label: 'Facebook' },
  { platform: 'x', label: 'X (Twitter)' },
  { platform: 'linkedin', label: 'LinkedIn' },
  { platform: 'instagram', label: 'Instagram' },
  { platform: 'youtube', label: 'YouTube' },
  { platform: 'tiktok', label: 'TikTok' },
  { platform: 'whatsapp', label: 'WhatsApp' },
] as const;

export type SocialPlatformId = (typeof SOCIAL_PLATFORMS)[number]['platform'];
