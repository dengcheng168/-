import sanitizeHtml from 'sanitize-html';

/**
 * 富文本内容（产品详细描述 / 博客正文 / 页面正文）保存前统一走这个白名单清洗，
 * 防止后台富文本编辑器粘贴内容中夹带 XSS 脚本或危险标签。
 */
export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr', 'blockquote', 'pre', 'code',
      'ul', 'ol', 'li',
      'strong', 'em', 'u', 's', 'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'span', 'div',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
      '*': ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
    },
  });
}
