/**
 * 从管理员填写的原始输入中提取 YouTube 视频 ID，统一解析成可嵌入的 embed 地址；
 * 支持：完整观看链接、分享短链（youtu.be/...）、embed 链接、纯视频 ID，
 * 也支持直接粘贴 YouTube「分享 → 嵌入」给出的完整 <iframe> 代码（自动提取其中的 src）。
 * 无法识别时返回 null（不渲染视频）。
 */
export function getYoutubeEmbedUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  let trimmed = input.trim();
  if (!trimmed) return null;

  if (trimmed.includes('<iframe')) {
    const match = trimmed.match(/src=["']([^"']+)["']/i);
    if (!match) return null;
    trimmed = match[1].trim();
  }

  if (/^[\w-]{11}$/.test(trimmed)) {
    return `https://www.youtube.com/embed/${trimmed}`;
  }

  try {
    const url = new URL(trimmed.startsWith('//') ? `https:${trimmed}` : trimmed);
    let id: string | null = null;

    if (url.hostname.includes('youtu.be')) {
      id = url.pathname.slice(1).split('/')[0] || null;
    } else if (url.hostname.includes('youtube.com')) {
      if (url.pathname.startsWith('/embed/')) {
        id = url.pathname.replace('/embed/', '').split('/')[0] || null;
      } else if (url.pathname.startsWith('/shorts/')) {
        id = url.pathname.replace('/shorts/', '').split('/')[0] || null;
      } else {
        id = url.searchParams.get('v');
      }
    }

    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
}
