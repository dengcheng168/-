import type { Locale } from './locales';

/**
 * 把一个英文站内绝对路径转换成对应 locale 下的路径，用于组件内部生成"停留在当前语言"的
 * 站内链接（分类/产品卡片/面包屑等）。与 Phase F 的 getLocalizedPath 不同：这里输入总是
 * "英文形态"的路径（调用方已经知道自己要链接到哪个英文页面），不需要处理"当前路径已经带
 * /es 前缀"的剥离逻辑。
 */
export function localeHref(path: string, locale: Locale): string {
  // 只处理站内绝对路径；外部链接（如 https://wa.me/... 之类导航项）原样返回，不加前缀
  if (locale === 'en' || !path.startsWith('/')) return path;
  return path === '/' ? '/es' : `/es${path}`;
}
