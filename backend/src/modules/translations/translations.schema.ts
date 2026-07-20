import { z } from 'zod';

/** 目前只支持西班牙语，未来加语言时只需要扩展这个数组 */
export const SUPPORTED_LOCALES = ['es'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const localeParamSchema = z.object({
  locale: z.enum(SUPPORTED_LOCALES),
});

export const upsertTranslationsSchema = z.object({
  locale: z.enum(SUPPORTED_LOCALES),
  entries: z
    .array(
      z.object({
        key: z.string().min(1).max(200),
        // 空字符串代表"清除译文，回退显示英文原文"
        value: z.string().max(5000),
      }),
    )
    .max(500),
});
