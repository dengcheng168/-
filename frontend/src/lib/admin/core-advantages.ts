import type { CoreAdvantage } from '@/types/settings';

/** 校验保存到首页的结构，避免合法 JSON 中的错误字段导致前台渲染失败。 */
export function parseCoreAdvantages(raw: string): CoreAdvantage[] {
  let value: unknown;
  try {
    value = JSON.parse(raw || '[]');
  } catch {
    throw new Error('核心优势内容无法读取，请刷新页面后重试。');
  }
  if (!Array.isArray(value)) throw new Error('核心优势必须是一个列表。');
  return value.map((item: unknown, index) => {
    if (!item || typeof item !== 'object' || !('title' in item) || typeof item.title !== 'string' || !item.title.trim()) {
      throw new Error(`请填写第 ${index + 1} 条核心优势的标题。`);
    }
    if ('description' in item && item.description !== undefined && typeof item.description !== 'string') {
      throw new Error(`第 ${index + 1} 条核心优势的说明必须是文字。`);
    }
    return {
      title: item.title.trim(),
      description: 'description' in item && typeof item.description === 'string' ? item.description.trim() : '',
    };
  });
}
