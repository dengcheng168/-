/**
 * 从管理员填写的原始输入中提取 YouTube 视频 ID，统一解析成可嵌入的 embed 地址；
 * 支持：完整观看链接、分享短链（youtu.be/...）、embed 链接、纯视频 ID，
 * 也支持直接粘贴 YouTube「分享 → 嵌入」给出的完整 <iframe> 代码（自动提取其中的 src）。
 * 无法识别时返回 null（不渲染视频）。
 */
export function getYoutubeVideoId(input: string | null | undefined): string | null {
  if (!input) return null;
  let trimmed = input.trim();
  if (!trimmed) return null;

  if (trimmed.includes('<iframe')) {
    const match = trimmed.match(/src=["']([^"']+)["']/i);
    if (!match) return null;
    trimmed = match[1].trim();
  }

  if (/^[\w-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed.startsWith('//') ? `https:${trimmed}` : trimmed);

    if (url.hostname.includes('youtu.be')) {
      return url.pathname.slice(1).split('/')[0] || null;
    }
    if (url.hostname.includes('youtube.com')) {
      if (url.pathname.startsWith('/embed/')) {
        return url.pathname.replace('/embed/', '').split('/')[0] || null;
      }
      if (url.pathname.startsWith('/shorts/')) {
        return url.pathname.replace('/shorts/', '').split('/')[0] || null;
      }
      return url.searchParams.get('v');
    }
    return null;
  } catch {
    return null;
  }
}

export function getYoutubeEmbedUrl(input: string | null | undefined): string | null {
  const id = getYoutubeVideoId(input);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}
