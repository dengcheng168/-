import sanitizeHtml from 'sanitize-html';

/**
 * 富文本内容（产品详细描述 / 博客正文 / 页面正文）保存前统一走这个白名单清洗，
 * 防止后台富文本编辑器粘贴内容中夹带 XSS 脚本或危险标签。
 *
 * 允许 style 属性和 <style> 标签：这个字段只有 SUPER_ADMIN/CONTENT_ADMIN 能编辑
 * （见 roles.ts 的 CONTENT_ROLES），属于可信管理员输入而非公开用户提交内容，
 * 放开内联/嵌入样式是为了支持管理员自己粘贴带完整排版（网格布局、卡片样式等）的
 * HTML 片段，而不是被强制拆成没有效果的纯标签。allowVulnerableTags 是 sanitize-html
 * 要求显式开启才能保留 <style> 标签的开关（该库默认会连标签带内容一起剥离）。
 */
export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr', 'blockquote', 'pre', 'code',
      'ul', 'ol', 'li',
      'strong', 'em', 'u', 's', 'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'span', 'div', 'style',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'decoding'],
      '*': ['class', 'style'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowVulnerableTags: true,
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
    },
  });
}
