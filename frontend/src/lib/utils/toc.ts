export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * 从博客正文 HTML 中提取 h2/h3 标题生成目录，并为对应标签注入 id 属性以便锚点跳转。
 * 正文 HTML 已由后端 sanitize-html 清洗，这里只做只读的标签级解析，不涉及用户输入拼接。
 */
export function extractHeadingsAndInjectIds(html: string): { html: string; headings: TocHeading[] } {
  const headings: TocHeading[] = [];
  const usedIds = new Set<string>();

  const updatedHtml = html.replace(/<h([23])(\s[^>]*)?>(.*?)<\/h\1>/gi, (match, levelStr, attrs, inner) => {
    const level = Number(levelStr) as 2 | 3;
    const text = inner.replace(/<[^>]+>/g, '').trim();
    if (!text) return match;

    let id = slugifyHeading(text) || 'section';
    let suffix = 2;
    while (usedIds.has(id)) {
      id = `${slugifyHeading(text)}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(id);
    headings.push({ id, text, level });

    const cleanAttrs = (attrs ?? '').replace(/\sid="[^"]*"/gi, '');
    return `<h${level}${cleanAttrs} id="${id}">${inner}</h${level}>`;
  });

  return { html: updatedHtml, headings };
}
